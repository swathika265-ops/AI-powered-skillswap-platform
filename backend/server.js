require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./utils/seed');
const setupSocket = require('./sockets');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// --- Security Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Exempt health check before rate limiter
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSwap API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.env === 'development' ? 1000 : config.rateLimit.max,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// --- Body Parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Static Files ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/skill-proofs', require('./routes/skillProofs'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/reputation', require('./routes/reputation'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/roadmaps', require('./routes/roadmaps'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// --- 404 Handler ---
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// --- Global Error Handler ---
app.use(errorHandler);

// --- Start Server ---
const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();
    setupSocket(io);

    server.listen(PORT, () => {
      console.log(`\n🚀 SkillSwap API Server`);
      console.log(`   Environment: ${config.env}`);
      console.log(`   Port: ${PORT}`);
      console.log(`   Frontend: ${config.cors.frontendUrl}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Socket.IO: Enabled\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
