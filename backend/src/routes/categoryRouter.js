'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const ctrl = require('../controllers/categoryController');

router.use(authenticate);
router.get('/', ctrl.getCategories);
router.post('/', ctrl.createCategory);
router.patch('/:id', ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
