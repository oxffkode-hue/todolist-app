'use strict';

const { z } = require('zod');

const VALID_ICONS = ['folder', 'star', 'heart', 'bolt', 'book', 'home', 'briefcase', 'cart', 'music', 'code', 'dumbbell', 'tag'];

const createCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요').max(50, '카테고리 이름은 50자 이하여야 합니다').trim(),
  icon: z.enum(VALID_ICONS, { errorMap: () => ({ message: '유효하지 않은 아이콘입니다' }) }).default('folder'),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, '카테고리 이름을 입력해주세요').max(50, '카테고리 이름은 50자 이하여야 합니다').trim(),
  icon: z.enum(VALID_ICONS, { errorMap: () => ({ message: '유효하지 않은 아이콘입니다' }) }).default('folder'),
});

module.exports = { createCategorySchema, updateCategorySchema };
