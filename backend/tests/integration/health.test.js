'use strict';

// env.config.js의 필수 환경변수 검증이 통과하도록 테스트 전에 설정한다.
process.env.JWT_SECRET = 'test-secret-key-min-32-chars-long-here';
process.env.POSTGRES_CONNECTION_STRING = 'postgresql://postgres:postgres@localhost:5432/todolist_test';
process.env.PORT = '3000';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/health', () => {
  it('200 상태코드를 반환한다', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });

  it('응답 body에 status: "success"가 포함된다', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.status).toBe('success');
  });

  it('응답 body에 data.message가 포함된다', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.message).toBeDefined();
  });

  it('존재하지 않는 라우트 GET /api/nonexistent 는 404를 반환한다', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
  });
});
