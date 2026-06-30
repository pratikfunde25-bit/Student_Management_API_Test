const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const normalizeError = (error) => {
  if (error instanceof AppError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    return new AppError(error.message, 400, 'VALIDATION_ERROR');
  }

  if (error instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid ${error.path}: ${error.value}`, 400, 'INVALID_ID');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    return new AppError(`${field} already exists`, 409, 'DUPLICATE_KEY');
  }

  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  return error;
};

const errorHandler = (error, req, res, next) => {
  const normalized = normalizeError(error);
  const statusCode = normalized.statusCode || 500;

  if (statusCode >= 500) {
    console.error(normalized);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: normalized.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode >= 500 ? 'Internal server error' : normalized.message,
    },
  });
};

module.exports = errorHandler;
