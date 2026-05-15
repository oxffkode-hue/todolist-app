'use strict';

const { z } = require('zod');

const createTodoSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하여야 합니다').trim(),
  description: z.string().max(2000, '설명은 2000자 이하여야 합니다').trim().optional(),
  categoryId: z.string().uuid('유효한 카테고리 ID가 아닙니다'),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다')
    .optional()
    .nullable(),
});

const updateTodoSchema = z
  .object({
    title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이하여야 합니다').trim().optional(),
    description: z.string().max(2000, '설명은 2000자 이하여야 합니다').trim().optional().nullable(),
    categoryId: z.string().uuid('유효한 카테고리 ID가 아닙니다').optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다')
      .optional()
      .nullable(),
    isCompleted: z.boolean({ invalid_type_error: 'isCompleted는 boolean이어야 합니다' }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 항목을 입력해주세요' });

const getTodosQuerySchema = z.object({
  categoryId: z.string().uuid('유효한 카테고리 ID가 아닙니다').optional(),
  isCompleted: z.enum(['true', 'false']).optional(),
  dueDateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다')
    .optional(),
  dueDateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다')
    .optional(),
});

module.exports = { createTodoSchema, updateTodoSchema, getTodosQuerySchema };
