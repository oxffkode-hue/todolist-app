'use strict';

const { findByEmail, findById, createUser, deleteUser } = require('../repositories/authRepository');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { signToken } = require('../utils/jwt.utils');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} = require('../errors/AppError');

function isValidPassword(pw) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

async function signup(email, password, name) {
  // BR-01: 이메일 중복 확인
  const existing = await findByEmail(email);
  if (existing) {
    throw new ConflictError('이미 사용 중인 이메일입니다', 'EMAIL_CONFLICT');
  }

  // BR-02: 비밀번호 형식 검증
  if (!isValidPassword(password)) {
    throw new BadRequestError(
      '비밀번호는 8자 이상 영문+숫자 조합이어야 합니다',
      'INVALID_PASSWORD_FORMAT'
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await createUser(email, hashedPassword, name);
  return user;
}

async function login(email, password) {
  // BR-03: 이메일 존재 여부 (구체적 원인 노출 금지)
  const user = await findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  // BR-03: 비밀번호 불일치
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const accessToken = signToken({ userId: user.id, email: user.email });

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

async function logout() {
  return;
}

async function deleteAccount(userId, password) {
  const user = await findById(userId);
  if (!user) {
    throw new UnauthorizedError('사용자를 찾을 수 없습니다');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  await deleteUser(userId);
}

module.exports = { signup, login, logout, deleteAccount };
