'use strict';

const bcrypt = require('bcrypt');

/**
 * 평문 비밀번호를 bcrypt로 해시화한다.
 * @param {string} plain - 평문 비밀번호
 * @returns {Promise<string>} 해시된 비밀번호
 */
async function hashPassword(plain) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return bcrypt.hash(plain, saltRounds);
}

/**
 * 평문 비밀번호와 해시를 비교한다.
 * @param {string} plain - 평문 비밀번호
 * @param {string} hash - 저장된 bcrypt 해시
 * @returns {Promise<boolean>} 일치 여부
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
