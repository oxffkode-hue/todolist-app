'use strict';

const { findById, updateName, updatePassword } = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { BadRequestError, UnauthorizedError } = require('../errors/AppError');

function isValidPassword(pw) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

async function updateProfile(userId, data) {
  const { name, currentPassword, password } = data;

  const hasName = name !== undefined;
  const hasPassword = password !== undefined;

  if (!hasName && !hasPassword) {
    throw new BadRequestError('수정할 내용이 없습니다', 'NO_UPDATE_FIELDS');
  }

  let updatedUser = null;

  if (hasName) {
    if (name.trim() === '') {
      throw new BadRequestError('이름은 비어있을 수 없습니다', 'NAME_EMPTY');
    }
    updatedUser = await updateName(userId, name);
  }

  if (hasPassword) {
    if (!currentPassword) {
      throw new BadRequestError('현재 비밀번호를 입력해주세요', 'CURRENT_PASSWORD_REQUIRED');
    }

    const user = await findById(userId);
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('현재 비밀번호가 올바르지 않습니다', 'PASSWORD_MISMATCH');
    }

    if (!isValidPassword(password)) {
      throw new BadRequestError(
        '비밀번호는 8자 이상 영문+숫자 조합이어야 합니다',
        'INVALID_PASSWORD_FORMAT'
      );
    }

    const hashed = await hashPassword(password);
    await updatePassword(userId, hashed);

    if (!updatedUser) {
      updatedUser = await findById(userId);
    }
  }

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    updatedAt: updatedUser.updatedAt,
  };
}

module.exports = { updateProfile };
