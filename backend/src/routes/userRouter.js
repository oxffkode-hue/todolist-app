'use strict';

const router = require('express').Router();
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const { updateProfileSchema } = require('../schemas/user.schema');
const ctrl = require('../controllers/userController');

router.use(authenticate);
router.patch('/me', validate(updateProfileSchema), ctrl.updateProfile);

module.exports = router;
