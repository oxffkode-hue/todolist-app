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
const bcrypt = require('bcrypt');

const TOKEN = signToken({ userId: 'user-uuid-1', email: 'user@example.com' });
const AUTH = { Authorization: `Bearer ${TOKEN}` };

// userRow는 beforeAll에서 실제 bcrypt 해시로 초기화됨
let userRow;

beforeAll(async () => {
  const hash = await bcrypt.hash('CurrentPass1', 4);
  userRow = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    password: hash,
    name: '테스터',
    created_at: new Date(),
    updated_at: new Date(),
  };
});

describe('Users API', () => {
  beforeEach(() => jest.clearAllMocks());

  // PATCH /api/users/me
  describe('PATCH /api/users/me', () => {
    // 1. 이름 변경 → 200
    it('이름 변경 → 200', async () => {
      // updateName → RETURNING id, email, name, created_at, updated_at
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: userRow.id,
          email: userRow.email,
          name: '새이름',
          created_at: userRow.created_at,
          updated_at: new Date(),
        }],
      });

      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({ name: '새이름' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('새이름');
      expect(res.body.data.email).toBe('user@example.com');
    });

    // 2. 빈 이름 → 400
    it('빈 이름 → 400', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({ name: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NAME_EMPTY');
    });

    // 3. 비밀번호 변경 성공 → 200
    it('비밀번호 변경 성공 → 200', async () => {
      // findById (현재 비밀번호 확인용)
      pool.query.mockResolvedValueOnce({ rows: [userRow] });
      // updatePassword
      pool.query.mockResolvedValueOnce({ rows: [] });
      // findById (updatedUser 조회 — name-only path 미실행 시 호출됨)
      pool.query.mockResolvedValueOnce({ rows: [userRow] });

      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({ currentPassword: 'CurrentPass1', password: 'NewPass123' });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@example.com');
    });

    // 4. 현재 비밀번호 불일치 → 401
    it('현재 비밀번호 불일치 → 401', async () => {
      // findById
      pool.query.mockResolvedValueOnce({ rows: [userRow] });

      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({ currentPassword: 'WrongPass1', password: 'NewPass123' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('PASSWORD_MISMATCH');
    });

    // 5. 새 비밀번호 형식 불량 → 400
    it('새 비밀번호 형식 불량 → 400', async () => {
      // findById (현재 비밀번호 확인용)
      pool.query.mockResolvedValueOnce({ rows: [userRow] });

      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({ currentPassword: 'CurrentPass1', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_PASSWORD_FORMAT');
    });

    // 6. 수정 내용 없음 → 400
    it('수정 내용 없음 (빈 body) → 400', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .set(AUTH)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_UPDATE_FIELDS');
    });

    // 7. 인증 없이 → 401
    it('인증 없이 → 401', async () => {
      const res = await request(app)
        .patch('/api/users/me')
        .send({ name: '새이름' });

      expect(res.status).toBe(401);
    });
  });
});
