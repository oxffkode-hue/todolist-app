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
  console.log(`[Auth] signup attempt: ${email}`);

  const existing = await findByEmail(email);
  if (existing) {
    console.warn(`[Auth] signup failed — email already in use: ${email}`);
    throw new ConflictError('이미 사용 중인 이메일입니다', 'EMAIL_CONFLICT');
  }

  if (!isValidPassword(password)) {
    console.warn(`[Auth] signup failed — invalid password format: ${email}`);
    throw new BadRequestError(
      '비밀번호는 8자 이상 영문+숫자 조합이어야 합니다',
      'INVALID_PASSWORD_FORMAT'
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await createUser(email, hashedPassword, name);
  console.log(`[Auth] signup success: userId=${user.id} email=${email}`);
  return user;
}

async function login(email, password) {
  console.log(`[Auth] login attempt: ${email}`);

  const user = await findByEmail(email);
  if (!user) {
    console.warn(`[Auth] login failed — user not found: ${email}`);
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    console.warn(`[Auth] login failed — password mismatch: ${email}`);
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  const accessToken = signToken({ userId: user.id, email: user.email });
  console.log(`[Auth] login success: userId=${user.id} email=${email}`);

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      darkMode: user.darkMode ?? false,
      language: user.language ?? 'ko',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

async function logout() {
  return;
}

async function deleteAccount(userId, password) {
  console.log(`[Auth] deleteAccount attempt: userId=${userId}`);

  const user = await findById(userId);
  if (!user) {
    console.warn(`[Auth] deleteAccount failed — user not found: userId=${userId}`);
    throw new UnauthorizedError('사용자를 찾을 수 없습니다');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    console.warn(`[Auth] deleteAccount failed — password mismatch: userId=${userId}`);
    throw new UnauthorizedError('이메일 또는 비밀번호가 올바르지 않습니다');
  }

  await deleteUser(userId);
  console.log(`[Auth] deleteAccount success: userId=${userId}`);
}

module.exports = { signup, login, logout, deleteAccount };
