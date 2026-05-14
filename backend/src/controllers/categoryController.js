'use strict';

const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/response.utils');

async function getCategories(req, res, next) {
  try {
    const { userId } = req.user;
    const categories = await categoryService.getCategories(userId);
    return res.status(200).json(successResponse(categories));
  } catch (err) {
    return next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { userId } = req.user;
    const { name, icon } = req.body;
    const category = await categoryService.createCategory(userId, name, icon);
    return res.status(201).json(successResponse(category));
  } catch (err) {
    return next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { userId } = req.user;
    const categoryId = req.params.id;
    const { name, icon } = req.body;
    const category = await categoryService.updateCategory(userId, categoryId, name, icon);
    return res.status(200).json(successResponse(category));
  } catch (err) {
    return next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { userId } = req.user;
    const categoryId = req.params.id;
    await categoryService.deleteCategory(userId, categoryId);
    return res.status(200).json(successResponse({ message: '카테고리가 삭제되었습니다.' }));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
