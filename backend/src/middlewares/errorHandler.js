'use strict';

const { AppError } = require('../errors/AppError');
const { errorResponse } = require('../utils/response.utils');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.code, err.message));
  }

  if (!isProduction) {
    console.error(err);
  }

  return res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', 'Internal Server Error'));
}

module.exports = { errorHandler };
