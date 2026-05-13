'use strict';

process.env.JWT_SECRET = 'test-secret-key-min-32-chars-long-here!!';
process.env.JWT_EXPIRES_IN = '1h';
process.env.POSTGRES_CONNECTION_STRING = 'postgresql://test:test@localhost/test';
process.env.BCRYPT_SALT_ROUNDS = '4';

jest.mock('../../src/db/pool', () => ({
  pool: { query: jest.fn() },
}));

const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/db/pool');
const { signToken } = require('../../src/utils/jwt.utils');

const TOKEN = signToken({ userId: 'user-uuid-1', email: 'user@example.com' });
const AUTH = { Authorization: `Bearer ${TOKEN}` };

// pool.query 결과는 snake_case 로 반환 → toCamel 이 camelCase 로 변환함
// 서비스 레이어는 camelCase 필드(isDefault, userId)를 사용하므로 mock row는 snake_case 여야 함
const defaultCategory = {
  id: 'cat-default-1',
  user_id: null,
  name: '업무',
  is_default: true,
  created_at: new Date(),
  updated_at: new Date(),
};
const userCategory = {
  id: 'cat-user-1',
  user_id: 'user-uuid-1',
  name: '내 카테고리',
  is_default: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Categories API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/categories', () => {
    it('기본 + 사용자 카테고리 목록 반환 → 200', async () => {
      pool.query.mockResolvedValueOnce({ rows: [defaultCategory, userCategory] });

      const res = await request(app).get('/api/categories').set(AUTH);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('토큰 없이 → 401', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/categories', () => {
    it('카테고리 생성 → 201', async () => {
      // findAllByUser: 기본 카테고리만 존재 (사용자 카테고리 없음 → 중복 없음)
      pool.query.mockResolvedValueOnce({ rows: [defaultCategory] });
      // create
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });

      const res = await request(app)
        .post('/api/categories')
        .set(AUTH)
        .send({ name: '내 카테고리' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('내 카테고리');
    });

    it('중복 이름 → 409', async () => {
      // findAllByUser: 동일 이름의 사용자 카테고리가 이미 존재
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });

      const res = await request(app)
        .post('/api/categories')
        .set(AUTH)
        .send({ name: '내 카테고리' });

      expect(res.status).toBe(409);
    });

    it('토큰 없이 → 401', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: '새 카테고리' });
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('카테고리 수정 → 200', async () => {
      // findById
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });
      // findAllByUser (중복 체크 — 다른 이름이므로 중복 없음)
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });
      // update
      pool.query.mockResolvedValueOnce({ rows: [{ ...userCategory, name: '새 이름' }] });

      const res = await request(app)
        .patch(`/api/categories/${userCategory.id}`)
        .set(AUTH)
        .send({ name: '새 이름' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('새 이름');
    });

    it('기본 카테고리 수정 → 403', async () => {
      pool.query.mockResolvedValueOnce({ rows: [defaultCategory] });

      const res = await request(app)
        .patch(`/api/categories/${defaultCategory.id}`)
        .set(AUTH)
        .send({ name: '수정 시도' });

      expect(res.status).toBe(403);
    });

    it('타인 카테고리 수정 → 403', async () => {
      const otherCategory = { ...userCategory, user_id: 'other-user-id' };
      pool.query.mockResolvedValueOnce({ rows: [otherCategory] });

      const res = await request(app)
        .patch(`/api/categories/${otherCategory.id}`)
        .set(AUTH)
        .send({ name: '수정 시도' });

      expect(res.status).toBe(403);
    });

    it('토큰 없이 → 401', async () => {
      const res = await request(app)
        .patch(`/api/categories/${userCategory.id}`)
        .send({ name: '수정' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('할일 없는 카테고리 삭제 → 200', async () => {
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });          // findById
      pool.query.mockResolvedValueOnce({ rows: [{ count: '0' }] });        // countTodosByCategory
      pool.query.mockResolvedValueOnce({ rows: [] });                       // deleteById

      const res = await request(app)
        .delete(`/api/categories/${userCategory.id}`)
        .set(AUTH);

      expect(res.status).toBe(200);
    });

    it('할일 있는 카테고리 삭제 → 400', async () => {
      pool.query.mockResolvedValueOnce({ rows: [userCategory] });           // findById
      pool.query.mockResolvedValueOnce({ rows: [{ count: '3' }] });        // countTodosByCategory

      const res = await request(app)
        .delete(`/api/categories/${userCategory.id}`)
        .set(AUTH);

      expect(res.status).toBe(400);
    });

    it('기본 카테고리 삭제 → 403', async () => {
      pool.query.mockResolvedValueOnce({ rows: [defaultCategory] });

      const res = await request(app)
        .delete(`/api/categories/${defaultCategory.id}`)
        .set(AUTH);

      expect(res.status).toBe(403);
    });

    it('토큰 없이 → 401', async () => {
      const res = await request(app)
        .delete(`/api/categories/${userCategory.id}`);
      expect(res.status).toBe(401);
    });
  });
});
