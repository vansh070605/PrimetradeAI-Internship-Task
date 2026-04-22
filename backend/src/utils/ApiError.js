/**
 * @file ApiError.js
 * @description Custom operational error class. Distinguishes between
 *              trusted (operational) errors and programming bugs.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {boolean} isOperational - true = expected error (validation, 404, etc.)
   * @param {string} stack      - Optional pre-existing stack trace
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
