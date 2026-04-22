/**
 * @file authMiddleware.js
 * @description JWT authentication middleware.
 *              Verifies Bearer token from Authorization header and attaches
 *              the decoded user payload to req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Protects routes — requires a valid JWT Bearer token.
 * Attaches req.user = { id, name, email, role }
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Authentication token missing.'));
    }

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Session expired. Please log in again.'));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new ApiError(401, 'Invalid authentication token.'));
      }
      return next(new ApiError(401, 'Authentication failed.'));
    }

    // 3. Verify the user still exists in DB (guards against deleted users)
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User no longer exists or has been deactivated.'));
    }

    // 4. Attach user to request context
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
