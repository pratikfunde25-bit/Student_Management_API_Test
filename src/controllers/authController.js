const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

/**
 * Login a user and generate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

/**
 * Get current logged in user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

module.exports = { register, login, me };
