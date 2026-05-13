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

// pool.query 반환값은 snake_case (DB 행 형식)
// toCamel 을 거쳐 서비스/컨트롤러에서 camelCase 로 사용됨
const todoRow = {
  id: 'todo-uuid-1',
  user_id: 'user-uuid-1',
  category_id: 'cat-uuid-1',
  title: '테스트 할일',
  description: null,
  due_date: null,
  is_completed: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const categoryRow = {
  id: 'cat-uuid-1',
  user_id: 'user-uuid-1',
  name: '업무',
  is_default: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Todos API', () => {
  beforeEach(() => jest.clearAllMocks());

  // 1. GET /api/todos → 200 + 배열
  describe('GET /api/todos', () => {
    it('할일 목록 반환 → 200 + 배열', async () => {
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });

      const res = await request(app)
        .get('/api/todos')
        .set(AUTH);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('테스트 할일');
    });

    // 2. GET /api/todos?isCompleted=false → 200
    it('isCompleted=false 필터 → 200', async () => {
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });

      const res = await request(app)
        .get('/api/todos?isCompleted=false')
        .set(AUTH);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // 13. 인증 없이 → 401
    it('인증 없이 → 401', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.status).toBe(401);
    });
  });

  // 3~5. POST /api/todos
  describe('POST /api/todos', () => {
    it('정상 생성 → 201 (category 존재 확인 mock 포함)', async () => {
      // findCategoryById (createTodo 내부)
      pool.query.mockResolvedValueOnce({ rows: [categoryRow] });
      // todoRepository.create
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });

      const res = await request(app)
        .post('/api/todos')
        .set(AUTH)
        .send({ title: '테스트 할일', categoryId: 'cat-uuid-1' });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('테스트 할일');
      expect(res.body.data.categoryId).toBe('cat-uuid-1');
    });

    it('title 없음 → 400', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set(AUTH)
        .send({ categoryId: 'cat-uuid-1' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('TITLE_REQUIRED');
    });

    it('categoryId 없음 → 400', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set(AUTH)
        .send({ title: '제목만 있는 할일' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CATEGORY_REQUIRED');
    });

    it('인증 없이 → 401', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({ title: '테스트', categoryId: 'cat-uuid-1' });
      expect(res.status).toBe(401);
    });
  });

  // 6~8. GET /api/todos/:id
  describe('GET /api/todos/:id', () => {
    it('존재하는 본인 할일 조회 → 200', async () => {
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });

      const res = await request(app)
        .get(`/api/todos/${todoRow.id}`)
        .set(AUTH);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(todoRow.id);
    });

    it('타인 소유 할일 조회 → 403', async () => {
      const otherTodo = { ...todoRow, user_id: 'other-user-uuid' };
      pool.query.mockResolvedValueOnce({ rows: [otherTodo] });

      const res = await request(app)
        .get(`/api/todos/${todoRow.id}`)
        .set(AUTH);

      expect(res.status).toBe(403);
    });

    it('존재하지 않는 할일 → 404', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/todos/nonexistent-id')
        .set(AUTH);

      expect(res.status).toBe(404);
    });

    it('인증 없이 → 401', async () => {
      const res = await request(app).get(`/api/todos/${todoRow.id}`);
      expect(res.status).toBe(401);
    });
  });

  // 9~10. PATCH /api/todos/:id
  describe('PATCH /api/todos/:id', () => {
    it('정상 수정 → 200', async () => {
      // findById (updateTodo 내부)
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });
      // todoRepository.update
      pool.query.mockResolvedValueOnce({ rows: [{ ...todoRow, title: '수정된 할일' }] });

      const res = await request(app)
        .patch(`/api/todos/${todoRow.id}`)
        .set(AUTH)
        .send({ title: '수정된 할일' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('수정된 할일');
    });

    it('빈 body → 400', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoRow.id}`)
        .set(AUTH)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_FIELDS_TO_UPDATE');
    });

    it('인증 없이 → 401', async () => {
      const res = await request(app)
        .patch(`/api/todos/${todoRow.id}`)
        .send({ title: '수정' });
      expect(res.status).toBe(401);
    });
  });

  // 11~12. DELETE /api/todos/:id
  describe('DELETE /api/todos/:id', () => {
    it('정상 삭제 → 200', async () => {
      // findById (deleteTodo 내부)
      pool.query.mockResolvedValueOnce({ rows: [todoRow] });
      // deleteById
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete(`/api/todos/${todoRow.id}`)
        .set(AUTH);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('할일이 삭제되었습니다.');
    });

    it('존재하지 않는 할일 삭제 → 404', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/todos/nonexistent-id')
        .set(AUTH);

      expect(res.status).toBe(404);
    });

    it('인증 없이 → 401', async () => {
      const res = await request(app).delete(`/api/todos/${todoRow.id}`);
      expect(res.status).toBe(401);
    });
  });
});
