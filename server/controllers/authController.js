const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendOtpEmail, sendPasswordResetOtp } = require('../config/email');
const { assertString, digitsOnly, sanitizeName } = require('../utils/fieldValidation');

const deliverOtp = async (email, name, otp) => {
  if (process.env.DEV_SHOW_OTP === 'true') {
    console.log(`🔐 DEV OTP for ${email}: ${otp}`);
  }
  try {
    await sendOtpEmail(email, name, otp);
  } catch (err) {
    // console.error('OTP email failed:', err.message, err.response || '');
    console.error("OTP email failed:", {
      message: err.message,
      code: err.code,
      response: err.response,
      command: err.command,
    });
    throw new AppError(
      'Could not send verification email. Check spam folder, or try again in a few minutes.',
      502
    );
  }
};

const otpDevPayload = otp =>
  process.env.NODE_ENV === 'development' && process.env.DEV_SHOW_OTP === 'true'
    ? { devOtp: otp }
    : {};

const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      address: user.address,
    },
  });
};

exports.register = asyncHandler(async (req, res) => {
  const name = assertString(sanitizeName(req.body.name), 'Name', { min: 2, max: 60, pattern: 'name' });
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });
  const password = req.body.password;
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    if (exists.isVerified) throw new AppError('Email already registered', 400);
    exists.name = name;
    exists.password = password;
    const otp = exists.generateOtp();
    await exists.save();
    await deliverOtp(email, name, otp);
    return res.status(200).json({
      success: true,
      message: 'OTP sent. Please verify your email.',
      email,
      ...otpDevPayload(otp),
    });
  }

  const user = await User.create({ name, email, password, isVerified: false });
  const otp = user.generateOtp();
  await user.save();
  await deliverOtp(email, name, otp);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Check your email for the OTP.',
    email,
    ...otpDevPayload(otp),
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });
  const otp = assertString(digitsOnly(req.body.otp, 6), 'OTP', { min: 6, max: 6, pattern: 'otp' });

  const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) return sendToken(user, 200, res);
  if (!user.verifyOtp(otp)) throw new AppError('Invalid or expired OTP', 400);

  user.isVerified = true;
  user.clearOtp();
  await user.save();
  sendToken(user, 200, res);
});

exports.resendOtp = asyncHandler(async (req, res) => {
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });

  const user = await User.findOne({ email }).select('+otp +otpExpiry');
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) throw new AppError('Account already verified', 400);

  const otp = user.generateOtp();
  await user.save();
  await deliverOtp(email, user.name, otp);

  res.json({
    success: true,
    message: 'New OTP sent to your email',
    ...otpDevPayload(otp),
  });
});

exports.login = asyncHandler(async (req, res) => {
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });
  const password = req.body.password;
  if (!password || typeof password !== 'string') throw new AppError('Password is required', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isVerified) {
    const otp = user.generateOtp();
    await user.save();
    await deliverOtp(email, user.name, otp);
    return res.status(403).json({
      success: false,
      needsVerification: true,
      message: 'Please verify your email. A new OTP has been sent.',
      email,
    });
  }
  sendToken(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, we sent a reset code' });
  }
  const otp = user.generateOtp();
  await user.save();
  await sendPasswordResetOtp(email, user.name, otp).catch(() => {});
  res.json({ success: true, message: 'If that email exists, we sent a reset code' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const email = assertString(req.body.email?.trim().toLowerCase(), 'Email', { min: 5, max: 120, pattern: 'email' });
  const otp = assertString(digitsOnly(req.body.otp, 6), 'OTP', { min: 6, max: 6, pattern: 'otp' });
  const password = req.body.password;
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const user = await User.findOne({ email }).select('+otp +otpExpiry +password');
  if (!user) throw new AppError('User not found', 404);
  if (!user.verifyOtp(otp)) throw new AppError('Invalid or expired OTP', 400);

  user.password = password;
  user.isVerified = true;
  user.clearOtp();
  await user.save();
  sendToken(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = assertString(sanitizeName(name), 'Name', { min: 2, max: 60, pattern: 'name' });
  if (phone !== undefined) {
    updates.phone = phone === ''
      ? ''
      : assertString(digitsOnly(phone, 15), 'Phone', { min: 10, max: 15, pattern: 'phone' });
  }
  if (address) updates.address = address;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: user });
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});
