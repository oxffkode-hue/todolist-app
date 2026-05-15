'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { signupSchema, loginSchema, deleteAccountSchema } = require('../schemas/auth.schema');
const ctrl = require('../controllers/authController');

router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.delete('/account', authenticate, validate(deleteAccountSchema), ctrl.deleteAccount);

module.exports = router;
