'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../schemas/category.schema');
const ctrl = require('../controllers/categoryController');

router.use(authenticate);
router.get('/', ctrl.getCategories);
router.post('/', validate(createCategorySchema), ctrl.createCategory);
router.patch('/:id', validate(updateCategorySchema), ctrl.updateCategory);
router.delete('/:id', ctrl.deleteCategory);

module.exports = router;
