'use strict';

const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다').max(255, '이메일은 255자 이하여야 합니다'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .max(72, '비밀번호는 72자 이하여야 합니다')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다').trim(),
});

const loginSchema = z.object({
  email: z.string().email('유효한 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요').max(72),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, '비밀번호를 입력해주세요').max(72),
});

module.exports = { signupSchema, loginSchema, deleteAccountSchema };
