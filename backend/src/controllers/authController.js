'use strict';

const authService = require('../services/authService');
const { successResponse } = require('../utils/response.utils');

const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const user = await authService.signup(email, password, name);
    res.status(201).json(successResponse(user));
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(successResponse(result));
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout();
    res.status(200).json(successResponse({ message: '로그아웃 되었습니다.' }));
  } catch (err) {
    next(err);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;
    await authService.deleteAccount(userId, password);
    res.status(200).json(successResponse({ message: '계정이 삭제되었습니다.' }));
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, deleteAccount };
