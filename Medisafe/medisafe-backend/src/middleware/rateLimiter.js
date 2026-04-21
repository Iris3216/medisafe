const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Login ได้แค่ 10 ครั้ง/15 นาที
  message: { error: 'Too many login attempts, please try again later.' },
});

module.exports = { limiter, authLimiter };