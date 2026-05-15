'use strict';

const { z } = require('zod');

const updateProfileSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다').trim().optional(),
    currentPassword: z.string().max(72).optional(),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .max(72, '비밀번호는 72자 이하여야 합니다')
      .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다')
      .optional(),
    darkMode: z.boolean({ invalid_type_error: 'darkMode는 boolean이어야 합니다' }).optional(),
    language: z.enum(['ko', 'en'], { errorMap: () => ({ message: "language는 'ko' 또는 'en'이어야 합니다" }) }).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: '수정할 항목을 입력해주세요' });

module.exports = { updateProfileSchema };
