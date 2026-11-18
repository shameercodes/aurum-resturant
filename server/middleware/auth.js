const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const User = require("../models/User");

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authenticated. Please log in.", 401));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      new AppError("Invalid or expired session. Please log in again.", 401),
    );
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User no longer exists.", 401));
  }

  if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
    return next(
      new AppError("Your session has expired. Please log in again.", 401),
    );
  }

  req.user = user;
  next();
});

exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action.", 403),
      );
    }

    next();
  };
