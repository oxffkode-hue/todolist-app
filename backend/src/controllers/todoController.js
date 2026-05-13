'use strict';

const todoService = require('../services/todoService');
const { successResponse } = require('../utils/response.utils');

const getTodos = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { categoryId, isCompleted, dueDateFrom, dueDateTo } = req.query;

    const filters = {};
    if (categoryId !== undefined) filters.categoryId = categoryId;
    if (isCompleted !== undefined) {
      filters.isCompleted = isCompleted === 'true' ? true : isCompleted === 'false' ? false : undefined;
    }
    if (dueDateFrom !== undefined) filters.dueDateFrom = dueDateFrom;
    if (dueDateTo !== undefined) filters.dueDateTo = dueDateTo;

    const todos = await todoService.getTodos(userId, filters);
    res.status(200).json(successResponse(todos));
  } catch (err) {
    next(err);
  }
};

const getTodoById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const todoId = req.params.id;

    const todo = await todoService.getTodoById(userId, todoId);
    res.status(200).json(successResponse(todo));
  } catch (err) {
    next(err);
  }
};

const createTodo = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, description, dueDate, categoryId } = req.body;

    const todo = await todoService.createTodo(userId, { title, description, dueDate, categoryId });
    res.status(201).json(successResponse(todo));
  } catch (err) {
    next(err);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const todoId = req.params.id;
    const { title, description, dueDate, categoryId, isCompleted } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if ('dueDate' in req.body) data.dueDate = dueDate;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isCompleted !== undefined) data.isCompleted = isCompleted;

    const todo = await todoService.updateTodo(userId, todoId, data);
    res.status(200).json(successResponse(todo));
  } catch (err) {
    next(err);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const todoId = req.params.id;

    await todoService.deleteTodo(userId, todoId);
    res.status(200).json(successResponse({ message: '할일이 삭제되었습니다.' }));
  } catch (err) {
    next(err);
  }
};

module.exports = { getTodos, getTodoById, createTodo, updateTodo, deleteTodo };
