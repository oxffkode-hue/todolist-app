'use strict';

const { verifyToken } = require('../utils/jwt.utils');
const { UnauthorizedError } = require('../errors/AppError');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('인증 토큰이 필요합니다', 'TOKEN_MISSING'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new UnauthorizedError('유효하지 않거나 만료된 토큰입니다', 'TOKEN_INVALID'));
  }
}

module.exports = { authenticate };
