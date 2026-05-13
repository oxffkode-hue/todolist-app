'use strict';

const categoryRepository = require('../repositories/categoryRepository');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} = require('../errors/AppError');

async function getCategories(userId) {
  return categoryRepository.findAllByUser(userId);
}

async function createCategory(userId, name) {
  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    c => c.name.toLowerCase() === name.toLowerCase() && c.userId === userId
  );
  if (duplicate) {
    throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
  }

  try {
    return await categoryRepository.create(userId, name);
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
    }
    throw err;
  }
}

async function updateCategory(userId, categoryId, name) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  if (category.isDefault) {
    throw new ForbiddenError('기본 카테고리는 수정/삭제할 수 없습니다', 'DEFAULT_CATEGORY');
  }

  if (category.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    c => c.name.toLowerCase() === name.toLowerCase() &&
         c.userId === userId &&
         c.id !== categoryId
  );
  if (duplicate) {
    throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
  }

  try {
    return await categoryRepository.update(categoryId, name);
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
    }
    throw err;
  }
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  if (category.isDefault) {
    throw new ForbiddenError('기본 카테고리는 수정/삭제할 수 없습니다', 'DEFAULT_CATEGORY');
  }

  if (category.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  const todoCount = await categoryRepository.countTodosByCategory(categoryId);
  if (todoCount > 0) {
    throw new BadRequestError('할일이 존재하는 카테고리는 삭제할 수 없습니다', 'CATEGORY_HAS_TODOS');
  }

  await categoryRepository.deleteById(categoryId);
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
