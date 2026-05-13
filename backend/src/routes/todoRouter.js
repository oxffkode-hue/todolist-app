'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const ctrl = require('../controllers/todoController');

router.get('/', authenticate, ctrl.getTodos);
router.post('/', authenticate, ctrl.createTodo);
router.get('/:id', authenticate, ctrl.getTodoById);
router.patch('/:id', authenticate, ctrl.updateTodo);
router.delete('/:id', authenticate, ctrl.deleteTodo);

module.exports = router;
