'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const ctrl = require('../controllers/authController');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.delete('/account', authenticate, ctrl.deleteAccount);

module.exports = router;
