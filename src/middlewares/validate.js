const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(message, 400, 'REQUEST_VALIDATION_ERROR'));
  }

  req.body = parsed.data.body || req.body;
  req.params = parsed.data.params || req.params;
  req.query = parsed.data.query || req.query;

  next();
};

module.exports = validate;
