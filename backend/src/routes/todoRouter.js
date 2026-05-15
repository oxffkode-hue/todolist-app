'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { createTodoSchema, updateTodoSchema, getTodosQuerySchema } = require('../schemas/todo.schema');
const ctrl = require('../controllers/todoController');

router.get('/', authenticate, validate(getTodosQuerySchema, 'query'), ctrl.getTodos);
router.post('/', authenticate, validate(createTodoSchema), ctrl.createTodo);
router.get('/:id', authenticate, ctrl.getTodoById);
router.patch('/:id', authenticate, validate(updateTodoSchema), ctrl.updateTodo);
router.delete('/:id', authenticate, ctrl.deleteTodo);

module.exports = router;
