'use strict';

const { AppError } = require('../errors/AppError');

const validate = (schema, target = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[target]);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join(', ');
    return next(new AppError(400, 'VALIDATION_ERROR', message));
  }
  req[target] = result.data;
  next();
};

module.exports = { validate };
