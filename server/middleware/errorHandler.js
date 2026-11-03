const AppError = require('../utils/AppError');

// ─── Format Mongoose validation errors ───
const handleValidationError = err => {
  const messages = Object.values(err.errors).map(e => e.message);
  return new AppError(messages.join(', '), 400);
};

// ─── Handle Mongoose cast errors (bad ObjectId) ───
const handleCastError = err =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

// ─── Handle Mongoose duplicate key errors ───
const handleDuplicateKeyError = err => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`Duplicate value for field: "${field}"`, 400);
};

// ─── Send error in development (full details) ───
const sendDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// ─── Send error in production (safe, minimal) ───
const sendProdError = (err, res) => {
  if (err.isOperational) {
    // Trusted, intentional error — send message to client
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or unknown error — don't leak details
    console.error('💥 Unexpected error:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

// ─── Global Error Handling Middleware ───
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);

    sendProdError(error, res);
  }
};

module.exports = errorHandler;
