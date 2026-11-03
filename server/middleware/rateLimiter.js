const rateLimit = require('express-rate-limit');

// ─── General API limiter ───
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});

// ─── Strict limiter for form submissions (reservations, contact) ───
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again in an hour.',
  },
});

// Auth OTP — allow more attempts than generic form limiter during testing
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 15 minutes and try again.',
  },
});

module.exports = { generalLimiter, writeLimiter, otpLimiter };
