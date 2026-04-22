/**
 * @file authService.js
 * @description Business logic for authentication.
 *              Controllers call this service; this service knows nothing about HTTP.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Generates a signed JWT for the given user.
 * @param {Object} user - Mongoose User document
 * @returns {string} Signed JWT string
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'task-management-api',
    }
  );
};

/**
 * Registers a new user.
 * Throws ApiError if email already exists.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: Object, token: string }}
 */
const register = async ({ name, email, password }) => {
  // Check for duplicate email (also enforced by unique index, but better UX to check early)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Create user — password is hashed by the pre-save hook in User model
  const user = await User.create({ name, email, password });

  const token = generateToken(user);

  return { user, token };
};

/**
 * Authenticates a user by email and password.
 * Uses a generic error message to prevent user enumeration.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {{ user: Object, token: string }}
 */
const login = async ({ email, password }) => {
  // Explicitly select password since it's select: false in the schema
  const user = await User.findOne({ email }).select('+password');

  // Use a constant-time comparison and generic message to prevent timing attacks / enumeration
  const isValidCredentials = user && (await user.comparePassword(password));

  if (!isValidCredentials) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
  }

  const token = generateToken(user);

  // Strip password from response
  user.password = undefined;

  return { user, token };
};

module.exports = { register, login };
