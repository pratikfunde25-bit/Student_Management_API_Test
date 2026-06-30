const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * Authentication Middleware: Protects routes by verifying JWT token
 * 1. Checks if token exists
 * 2. Verifies token signature
 * 3. Checks if user still exists
 * 4. Checks if password was changed after token was issued
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication token is required', 401, 'AUTH_REQUIRED');
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.sub).select('+passwordChangedAt');

  if (!user || !user.isActive) {
    throw new AppError('User no longer exists or is inactive', 401, 'USER_INACTIVE');
  }

  if (user.passwordChangedAfter(decoded.iat)) {
    throw new AppError('Password changed after token was issued', 401, 'TOKEN_STALE');
  }

  req.user = user;
  next();
});

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'teacher')
 * @returns Middleware function
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
  }

  next();
};

module.exports = { protect, authorize };
