const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// ─── Protect: verify JWT from cookie or Authorization header ───
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User no longer exists', 401));

  req.user = user;
  next();
});

// ─── Authorize: restrict to specific roles ───
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`Role "${req.user.role}" is not authorized for this action`, 403));
  }
  next();
};
