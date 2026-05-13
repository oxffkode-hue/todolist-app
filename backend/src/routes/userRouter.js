'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const ctrl = require('../controllers/userController');

router.use(authenticate);
router.patch('/me', ctrl.updateProfile);

module.exports = router;
