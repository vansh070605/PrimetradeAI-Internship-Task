/**
 * @file errorHandler.js
 * @description Centralized error handling middleware.
 *
 *              Converts operational errors (ApiError) into structured JSON.
 *              For programming bugs, returns 500 without leaking internals.
 *              Handles Mongoose-specific errors (validation, cast, duplicate key).
 */

const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Converts Mongoose errors into ApiError instances.
 * @param {Error} err
 * @returns {ApiError}
 */
const handleMongooseError = (err) => {
  // Validation error (schema constraints)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    return new ApiError(400, `Validation failed: ${messages}`);
  }

  // Cast error (e.g., invalid MongoDB ObjectId in URL params)
  if (err.name === 'CastError') {
    return new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // Duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new ApiError(409, `${field} already exists. Please use a different value.`);
  }

  return null; // Not a recognized Mongoose error
};

// Express recognizes error handlers by their 4-parameter signature
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Try to convert mongoose errors
  const mongooseError = handleMongooseError(err);
  if (mongooseError) {
    error = mongooseError;
  }

  // If it's not an operational ApiError, wrap it as a generic 500
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log server errors (5xx) with full context; client errors (4xx) at warn
  if (error.statusCode >= 500) {
    logger.error({
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn({
      message: error.message,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    status: error.status,
    message: error.message,
    // Only include stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
