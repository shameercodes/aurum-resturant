const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

/**
 * Middleware to validate MongoDB ObjectId params.
 * Usage: router.get('/:id', validateObjectId, controller)
 */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(`Invalid ID format: ${req.params.id}`, 400));
  }
  next();
};

module.exports = validateObjectId;
