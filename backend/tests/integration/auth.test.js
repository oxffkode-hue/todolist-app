'use strict';

// 환경변수 설정 (pool.js의 env.config 로드 전에)
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

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /api/auth/signup
  describe('POST /api/auth/signup', () => {
    it('정상 회원가입 → 201 + 사용자 정보 반환', async () => {
      // findByEmail: 없음
      pool.query.mockResolvedValueOnce({ rows: [] });
      // createUser: 생성된 유저
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-uuid-1',
          email: 'test@example.com',
          name: '테스터',
          created_at: new Date(),
          updated_at: new Date(),
        }],
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'Password1', name: '테스터' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('이메일 중복 → 409 Conflict', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'existing', email: 'test@example.com', password: 'hash', name: '기존', created_at: new Date(), updated_at: new Date() }],
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'Password1', name: '테스터' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_CONFLICT');
    });

    it('비밀번호 형식 불량 (너무 짧음) → 400 Bad Request', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'short', name: '테스터' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_PASSWORD_FORMAT');
    });

    it('숫자 없는 비밀번호 → 400', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: 'onlyletters', name: '테스터' });

      expect(res.status).toBe(400);
    });
  });

  // POST /api/auth/login
  describe('POST /api/auth/login', () => {
    it('정상 로그인 → 200 + accessToken 반환', async () => {
      const hash = await bcrypt.hash('Password1', 4);
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'user@example.com', password: hash, name: '사용자', created_at: new Date(), updated_at: new Date() }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'Password1' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('user@example.com');
    });

    it('이메일 없음 → 401 Unauthorized', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'no@example.com', password: 'Password1' });

      expect(res.status).toBe(401);
    });

    it('비밀번호 불일치 → 401 Unauthorized', async () => {
      const hash = await bcrypt.hash('CorrectPass1', 4);
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'user@example.com', password: hash, name: '사용자', created_at: new Date(), updated_at: new Date() }],
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@example.com', password: 'WrongPass1' });

      expect(res.status).toBe(401);
    });
  });

  // POST /api/auth/logout
  describe('POST /api/auth/logout', () => {
    it('유효한 토큰으로 로그아웃 → 200', async () => {
      const token = signToken({ userId: 'user-1', email: 'user@example.com' });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('로그아웃 되었습니다.');
    });

    it('토큰 없이 로그아웃 → 401', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  // DELETE /api/auth/account
  describe('DELETE /api/auth/account', () => {
    it('정상 탈퇴 → 200', async () => {
      const hash = await bcrypt.hash('Password1', 4);
      const token = signToken({ userId: 'user-1', email: 'user@example.com' });

      // findById
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'user@example.com', password: hash, name: '사용자', created_at: new Date(), updated_at: new Date() }],
      });
      // deleteUser
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'Password1' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('계정이 삭제되었습니다.');
    });

    it('비밀번호 불일치 → 401', async () => {
      const hash = await bcrypt.hash('CorrectPass1', 4);
      const token = signToken({ userId: 'user-1', email: 'user@example.com' });

      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-1', email: 'user@example.com', password: hash, name: '사용자', created_at: new Date(), updated_at: new Date() }],
      });

      const res = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'WrongPass1' });

      expect(res.status).toBe(401);
    });

    it('토큰 없이 탈퇴 → 401', async () => {
      const res = await request(app)
        .delete('/api/auth/account')
        .send({ password: 'Password1' });
      expect(res.status).toBe(401);
    });
  });
});
