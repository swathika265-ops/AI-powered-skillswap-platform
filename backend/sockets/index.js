const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const setupSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);

    // Join user's personal room for notifications
    socket.join(socket.userId);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    // Handle real-time messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, messageType } = data;
        const conv = await Conversation.findById(conversationId);
        if (!conv || !conv.participants.map(p => p.toString()).includes(socket.userId)) return;

        const recipientId = conv.participants.find(p => p.toString() !== socket.userId).toString();

        const message = await Message.create({
          conversationId, senderId: socket.userId, recipientId, content, messageType: messageType || 'text',
        });

        conv.lastMessage = content.substring(0, 100);
        conv.lastMessageAt = new Date();
        await conv.save();

        // Emit to conversation room
        io.to(`conv_${conversationId}`).emit('new_message', {
          ...message.toObject(),
          senderName: socket.user.name,
        });

        // Notify recipient
        io.to(recipientId).emit('notification', {
          type: 'new_message',
          title: 'New Message',
          message: `${socket.user.name}: ${content.substring(0, 50)}`,
          conversationId,
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`conv_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId, name: socket.user.name,
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`conv_${data.conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocket;
