const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { writeLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register', otpLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', otpLimiter, login);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);
router.post('/logout', protect, logout);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);

module.exports = router;
