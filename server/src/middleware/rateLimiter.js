const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for AI endpoints — expensive calls.
 * 30 requests per minute per IP.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to AI endpoints. Please slow down.' },
});

/**
 * Rate limiter for auth endpoints — prevent brute force.
 * 10 requests per minute per IP.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

module.exports = { aiLimiter, authLimiter };
