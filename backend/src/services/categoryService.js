'use strict';

const categoryRepository = require('../repositories/categoryRepository');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} = require('../errors/AppError');

async function getCategories(userId) {
  console.log(`[Category] getCategories: userId=${userId}`);
  return categoryRepository.findAllByUser(userId);
}

async function createCategory(userId, name, icon = 'folder') {
  console.log(`[Category] createCategory: userId=${userId} name="${name}" icon="${icon}"`);

  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    c => c.name.toLowerCase() === name.toLowerCase() && c.userId === userId
  );
  if (duplicate) {
    console.warn(`[Category] createCategory failed — duplicate name: "${name}" userId=${userId}`);
    throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
  }

  try {
    const category = await categoryRepository.create(userId, name, icon);
    console.log(`[Category] createCategory success: categoryId=${category.id} name="${name}"`);
    return category;
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
    }
    throw err;
  }
}

async function updateCategory(userId, categoryId, name, icon = 'folder') {
  console.log(`[Category] updateCategory: categoryId=${categoryId} userId=${userId} name="${name}" icon="${icon}"`);

  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    console.warn(`[Category] updateCategory failed — not found: categoryId=${categoryId}`);
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  if (category.isDefault) {
    console.warn(`[Category] updateCategory failed — default category: categoryId=${categoryId}`);
    throw new ForbiddenError('기본 카테고리는 수정/삭제할 수 없습니다', 'DEFAULT_CATEGORY');
  }

  if (category.userId !== userId) {
    console.warn(`[Category] updateCategory failed — forbidden: categoryId=${categoryId} userId=${userId}`);
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    c => c.name.toLowerCase() === name.toLowerCase() &&
         c.userId === userId &&
         c.id !== categoryId
  );
  if (duplicate) {
    console.warn(`[Category] updateCategory failed — duplicate name: "${name}" userId=${userId}`);
    throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
  }

  try {
    const updated = await categoryRepository.update(categoryId, name, icon);
    console.log(`[Category] updateCategory success: categoryId=${categoryId} name="${name}"`);
    return updated;
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError('이미 존재하는 카테고리 이름입니다', 'CATEGORY_NAME_DUPLICATE');
    }
    throw err;
  }
}

async function deleteCategory(userId, categoryId) {
  console.log(`[Category] deleteCategory: categoryId=${categoryId} userId=${userId}`);

  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    console.warn(`[Category] deleteCategory failed — not found: categoryId=${categoryId}`);
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  if (category.isDefault) {
    console.warn(`[Category] deleteCategory failed — default category: categoryId=${categoryId}`);
    throw new ForbiddenError('기본 카테고리는 수정/삭제할 수 없습니다', 'DEFAULT_CATEGORY');
  }

  if (category.userId !== userId) {
    console.warn(`[Category] deleteCategory failed — forbidden: categoryId=${categoryId} userId=${userId}`);
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  const todoCount = await categoryRepository.countTodosByCategory(categoryId);
  if (todoCount > 0) {
    console.warn(`[Category] deleteCategory failed — has todos (${todoCount}): categoryId=${categoryId}`);
    throw new BadRequestError('할일이 존재하는 카테고리는 삭제할 수 없습니다', 'CATEGORY_HAS_TODOS');
  }

  await categoryRepository.deleteById(categoryId);
  console.log(`[Category] deleteCategory success: categoryId=${categoryId}`);
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
