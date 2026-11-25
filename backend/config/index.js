// Centralized configuration loaded from environment variables
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  upload: {
    maxSizeMB: parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 10,
    dir: process.env.UPLOAD_DIR || 'uploads',
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  },
  translation: {
    provider: process.env.TRANSLATION_PROVIDER || 'libre',
    libreTranslateUrl: process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  assessment: {
    defaultPassPercentage: parseInt(process.env.DEFAULT_PASS_PERCENTAGE, 10) || 70,
    defaultMaxViolations: parseInt(process.env.DEFAULT_MAX_VIOLATIONS, 10) || 3,
    defaultMaxAttempts: parseInt(process.env.DEFAULT_MAX_ATTEMPTS, 10) || 3,
    defaultCooldownHours: parseInt(process.env.DEFAULT_COOLDOWN_HOURS, 10) || 24,
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@skillswap.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
};

module.exports = config;
