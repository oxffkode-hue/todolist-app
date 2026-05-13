'use strict';

const jwt = require('jsonwebtoken');

/**
 * JWT 토큰을 서명하여 반환한다.
 * @param {object} payload - 토큰에 포함할 페이로드 (userId, email)
 * @returns {string} 서명된 JWT 토큰
 */
function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * JWT 토큰을 검증하고 페이로드를 반환한다.
 * @param {string} token - 검증할 JWT 토큰
 * @returns {object} 디코딩된 페이로드
 * @throws {Error} 토큰이 유효하지 않거나 만료된 경우
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
