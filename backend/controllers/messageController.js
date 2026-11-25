const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// GET /api/messages/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name profileImage').sort({ lastMessageAt: -1 });
    res.json({ success: true, data: conversations });
  } catch (error) { next(error); }
};

// POST /api/messages/conversations
const createConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    if (recipientId === req.user._id.toString()) return res.status(400).json({ success: false, error: 'Cannot message yourself' });

    const existing = await Conversation.findOne({ participants: { $all: [req.user._id, recipientId], $size: 2 } });
    if (existing) return res.json({ success: true, data: existing });

    const conv = await Conversation.create({ participants: [req.user._id, recipientId] });
    const populated = await Conversation.findById(conv._id).populate('participants', 'name profileImage');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

// GET /api/messages/:conversationId
const getMessages = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.conversationId);
    if (!conv || !conv.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this conversation' });
    }

    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, recipientId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (error) { next(error); }
};

// POST /api/messages/:conversationId
const sendMessage = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.conversationId);
    if (!conv || !conv.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const recipientId = conv.participants.find(p => p.toString() !== req.user._id.toString());
    const { content, messageType } = req.body;

    const message = await Message.create({
      conversationId: conv._id, senderId: req.user._id, recipientId,
      content, messageType: messageType || 'text',
    });

    conv.lastMessage = content.substring(0, 100);
    conv.lastMessageAt = new Date();
    await conv.save();

    await Notification.create({
      userId: recipientId, type: 'new_message', title: 'New Message',
      message: `${req.user.name}: ${content.substring(0, 50)}`,
      referenceId: conv._id, referenceModel: 'Conversation',
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
};

// POST /api/messages/translate
const translateMessage = async (req, res, next) => {
  try {
    const { text, targetLanguage } = req.body;
    // Using free LibreTranslate or fallback
    try {
      const axios = require('axios');
      const config = require('../config');
      const response = await axios.post(`${config.translation.libreTranslateUrl}/translate`, {
        q: text, source: 'auto', target: targetLanguage, format: 'text',
      }, { timeout: 5000 });
      res.json({ success: true, data: { translatedText: response.data.translatedText, source: 'api' } });
    } catch {
      // Fallback: return original with notice
      res.json({ success: true, data: { translatedText: text, source: 'fallback', note: 'Translation service unavailable' } });
    }
  } catch (error) { next(error); }
};

module.exports = { getConversations, createConversation, getMessages, sendMessage, translateMessage };
