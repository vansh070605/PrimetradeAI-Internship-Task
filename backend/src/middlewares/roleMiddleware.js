/**
 * @file roleMiddleware.js
 * @description Role-Based Access Control (RBAC) middleware.
 *              Must be used AFTER the protect middleware (requires req.user).
 */

const ApiError = require('../utils/ApiError');

/**
 * Factory function that returns middleware restricting access to given roles.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user')
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/tasks/:id', protect, requireRole('admin'), deleteTask);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should never happen if protect runs first, but guard anyway
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = { requireRole };
