'use strict';

const userService = require('../services/userService');
const { successResponse } = require('../utils/response.utils');

const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, password } = req.body;
    const { userId } = req.user;

    const user = await userService.updateProfile(userId, { name, currentPassword, password });
    res.status(200).json(successResponse(user));
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile };
