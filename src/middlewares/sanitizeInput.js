const clean = (value) => {
  if (typeof value === 'string') {
    // Strip HTML tags to prevent XSS injection
    return value.replace(/<[^>]*>/g, '');
  }

  if (Array.isArray(value)) return value.map(clean);

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        value[key] = clean(value[key]);
      }
    }
  }

  return value;
};

const sanitizeInput = (req, res, next) => {
  clean(req.body);
  clean(req.params);
  clean(req.query);
  next();
};

module.exports = sanitizeInput;
