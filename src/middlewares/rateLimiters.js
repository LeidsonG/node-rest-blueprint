const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Muitas tentativas. Tente novamente mais tarde.',
  },
});

module.exports = { authLimiter };
