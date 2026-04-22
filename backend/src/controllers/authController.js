/**
 * @file authController.js
 * @description Thin HTTP layer for auth routes.
 *              Delegates all business logic to authService.
 */

const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/v1/auth/register
 * Registers a new user and returns a JWT.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });

    res.status(201).json(
      new ApiResponse(201, { user, token }, 'Registration successful.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    res.status(200).json(
      new ApiResponse(200, { user, token }, 'Login successful.')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json(
      new ApiResponse(200, { user: req.user }, 'Profile fetched successfully.')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
