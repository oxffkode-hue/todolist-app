'use strict';

const { findById, updateName, updatePassword, updateDarkMode, updateLanguage } = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password.utils');
const { BadRequestError, UnauthorizedError } = require('../errors/AppError');

function isValidPassword(pw) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
}

async function updateProfile(userId, data) {
  const { name, currentPassword, password, darkMode, language } = data;
  const hasName = name !== undefined;
  const hasPassword = password !== undefined;
  const hasDarkMode = darkMode !== undefined;
  const hasLanguage = language !== undefined;

  console.log(`[User] updateProfile: userId=${userId} fields=${[hasName && 'name', hasPassword && 'password', hasDarkMode && 'darkMode', hasLanguage && 'language'].filter(Boolean).join(',')}`);

  if (!hasName && !hasPassword && !hasDarkMode && !hasLanguage) {
    console.warn(`[User] updateProfile failed — no fields: userId=${userId}`);
    throw new BadRequestError('수정할 내용이 없습니다', 'NO_UPDATE_FIELDS');
  }

  let updatedUser = null;

  if (hasName) {
    if (name.trim() === '') {
      console.warn(`[User] updateProfile failed — empty name: userId=${userId}`);
      throw new BadRequestError('이름은 비어있을 수 없습니다', 'NAME_EMPTY');
    }
    updatedUser = await updateName(userId, name);
    console.log(`[User] name updated: userId=${userId}`);
  }

  if (hasPassword) {
    if (!currentPassword) {
      console.warn(`[User] updateProfile failed — currentPassword missing: userId=${userId}`);
      throw new BadRequestError('현재 비밀번호를 입력해주세요', 'CURRENT_PASSWORD_REQUIRED');
    }

    const user = await findById(userId);
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      console.warn(`[User] updateProfile failed — password mismatch: userId=${userId}`);
      throw new UnauthorizedError('현재 비밀번호가 올바르지 않습니다', 'PASSWORD_MISMATCH');
    }

    if (!isValidPassword(password)) {
      console.warn(`[User] updateProfile failed — invalid new password format: userId=${userId}`);
      throw new BadRequestError(
        '비밀번호는 8자 이상 영문+숫자 조합이어야 합니다',
        'INVALID_PASSWORD_FORMAT'
      );
    }

    const hashed = await hashPassword(password);
    await updatePassword(userId, hashed);
    console.log(`[User] password updated: userId=${userId}`);

    if (!updatedUser) {
      updatedUser = await findById(userId);
    }
  }

  if (hasDarkMode) {
    updatedUser = await updateDarkMode(userId, darkMode);
    console.log(`[User] darkMode updated: userId=${userId} darkMode=${darkMode}`);
  }

  if (hasLanguage) {
    updatedUser = await updateLanguage(userId, language);
    console.log(`[User] language updated: userId=${userId} language=${language}`);
  }

  if (!updatedUser) {
    updatedUser = await findById(userId);
  }

  console.log(`[User] updateProfile success: userId=${userId}`);
  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    darkMode: updatedUser.darkMode,
    language: updatedUser.language ?? 'ko',
    updatedAt: updatedUser.updatedAt,
  };
}

module.exports = { updateProfile };
