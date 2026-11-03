/**
 * Wraps an async Express route handler and forwards any errors
 * to the next() error middleware — eliminates try/catch boilerplate.
 *
 * @param {Function} fn  Async route handler
 * @returns {Function}   Express middleware
 */
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
