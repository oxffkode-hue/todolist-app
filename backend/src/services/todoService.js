'use strict';

const todoRepository = require('../repositories/todoRepository');
const { findById: findCategoryById } = require('../repositories/categoryRepository');
const { BadRequestError, ForbiddenError, NotFoundError } = require('../errors/AppError');

async function getTodos(userId, filters) {
  console.log(`[Todo] getTodos: userId=${userId} filters=${JSON.stringify(filters)}`);
  return todoRepository.findAllByUser(userId, filters);
}

async function getTodoById(userId, todoId) {
  console.log(`[Todo] getTodoById: todoId=${todoId} userId=${userId}`);

  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    console.warn(`[Todo] getTodoById failed — not found: todoId=${todoId}`);
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    console.warn(`[Todo] getTodoById failed — forbidden: todoId=${todoId} userId=${userId}`);
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }
  return todo;
}

async function createTodo(userId, data) {
  const { title, description, dueDate, categoryId } = data;
  console.log(`[Todo] createTodo: userId=${userId} categoryId=${categoryId} title="${title}"`);

  if (!title || title.trim() === '') {
    console.warn(`[Todo] createTodo failed — title required: userId=${userId}`);
    throw new BadRequestError('제목은 필수입니다', 'TITLE_REQUIRED');
  }
  if (categoryId === undefined || categoryId === null) {
    console.warn(`[Todo] createTodo failed — categoryId required: userId=${userId}`);
    throw new BadRequestError('카테고리는 필수입니다', 'CATEGORY_REQUIRED');
  }

  const category = await findCategoryById(categoryId);
  if (!category) {
    console.warn(`[Todo] createTodo failed — category not found: categoryId=${categoryId}`);
    throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
  }

  const todo = await todoRepository.create(userId, categoryId, title.trim(), description, dueDate);
  console.log(`[Todo] createTodo success: todoId=${todo.id} userId=${userId}`);
  return todo;
}

async function updateTodo(userId, todoId, data) {
  console.log(`[Todo] updateTodo: todoId=${todoId} userId=${userId} fields=${Object.keys(data).join(',')}`);

  if (Object.keys(data).length === 0) {
    console.warn(`[Todo] updateTodo failed — no fields: todoId=${todoId}`);
    throw new BadRequestError('수정할 항목이 없습니다', 'NO_FIELDS_TO_UPDATE');
  }

  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    console.warn(`[Todo] updateTodo failed — not found: todoId=${todoId}`);
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    console.warn(`[Todo] updateTodo failed — forbidden: todoId=${todoId} userId=${userId}`);
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  if (data.categoryId !== undefined) {
    const category = await findCategoryById(data.categoryId);
    if (!category) {
      console.warn(`[Todo] updateTodo failed — category not found: categoryId=${data.categoryId}`);
      throw new NotFoundError('카테고리를 찾을 수 없습니다', 'CATEGORY_NOT_FOUND');
    }
  }

  const updated = await todoRepository.update(todoId, data);
  console.log(`[Todo] updateTodo success: todoId=${todoId}`);
  return updated;
}

async function deleteTodo(userId, todoId) {
  console.log(`[Todo] deleteTodo: todoId=${todoId} userId=${userId}`);

  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    console.warn(`[Todo] deleteTodo failed — not found: todoId=${todoId}`);
    throw new NotFoundError('할일을 찾을 수 없습니다', 'TODO_NOT_FOUND');
  }
  if (todo.userId !== userId) {
    console.warn(`[Todo] deleteTodo failed — forbidden: todoId=${todoId} userId=${userId}`);
    throw new ForbiddenError('권한이 없습니다', 'FORBIDDEN');
  }

  await todoRepository.deleteById(todoId);
  console.log(`[Todo] deleteTodo success: todoId=${todoId}`);
}

module.exports = { getTodos, getTodoById, createTodo, updateTodo, deleteTodo };
