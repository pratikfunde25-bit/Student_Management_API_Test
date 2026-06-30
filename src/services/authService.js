const ROLES = require('../constants/roles');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

/**
 * Register a new user in the system
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.email
 * @param {string} payload.password
 * @returns {Promise<Object>} The created user and a JWT token
 */
const register = async ({ name, email, password, role }) => {
  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.STUDENT,
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: signToken(user),
  };
};

/**
 * Authenticate a user and return a JWT token
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @returns {Promise<Object>} The authenticated user and a JWT token
 * @throws {AppError} If credentials are invalid or account is inactive
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('User account is inactive', 403, 'USER_INACTIVE');
  }

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: signToken(user),
  };
};

module.exports = { register, login };
