'use strict';

const todoRepository = require('../repositories/todoRepository');
const { findById: findCategoryById } = require('../repositories/categoryRepository');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../errors/AppError');

async function getTodos(userId, filters) {
  return todoRepository.findAllByUser(userId, filters);
}

async function getTodoById(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }
  return todo;
}

async function createTodo(userId, data) {
  const { title, description, dueDate, categoryId } = data;

  if (!title || title.trim() === '') {
    throw new BadRequestError('제목은 필수입니다', 'TITLE_REQUIRED');
  }
  if (categoryId === undefined || categoryId === null) {
    throw new BadRequestError('카테고리는 필수입니다', 'CATEGORY_REQUIRED');
  }

  const category = await findCategoryById(categoryId);
  if (!category) {
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  return todoRepository.create(userId, categoryId, title.trim(), description, dueDate);
}

async function updateTodo(userId, todoId, data) {
  if (Object.keys(data).length === 0) {
    throw new BadRequestError('수정할 항목이 없습니다', 'NO_FIELDS_TO_UPDATE');
  }

  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  if (data.categoryId !== undefined) {
    const category = await findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
    }
  }

  return todoRepository.update(todoId, data);
}

async function deleteTodo(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  await todoRepository.deleteById(todoId);
}

module.exports = { getTodos, getTodoById, createTodo, updateTodo, deleteTodo };
