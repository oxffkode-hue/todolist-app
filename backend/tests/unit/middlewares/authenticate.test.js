'use strict';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-min-32-chars-long-here!!';
  process.env.JWT_EXPIRES_IN = '1h';
});

const { authenticate } = require('../../../src/middlewares/authenticate');
const { signToken } = require('../../../src/utils/jwt.utils');
const { UnauthorizedError } = require('../../../src/errors/AppError');

function mockReqRes(authHeader) {
  const req = { headers: authHeader ? { authorization: authHeader } : {} };
  const res = {};
  return { req, res };
}

describe('authenticate 미들웨어', () => {
  it('Authorization 헤더가 없으면 UnauthorizedError(TOKEN_MISSING)를 next에 전달', () => {
    const { req, res } = mockReqRes(null);
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('TOKEN_MISSING');
  });

  it('Bearer 형식이 아닌 헤더는 UnauthorizedError(TOKEN_MISSING)를 next에 전달', () => {
    const { req, res } = mockReqRes('Basic abc123');
    const next = jest.fn();

    authenticate(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.code).toBe('TOKEN_MISSING');
  });

  it('"Bearer " 뒤에 토큰이 없으면 UnauthorizedError(TOKEN_INVALID)를 next에 전달', () => {
    const { req, res } = mockReqRes('Bearer ');
    const next = jest.fn();

    authenticate(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it('유효하지 않은 토큰은 UnauthorizedError(TOKEN_INVALID)를 next에 전달', () => {
    const { req, res } = mockReqRes('Bearer invalid.token.here');
    const next = jest.fn();

    authenticate(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.code).toBe('TOKEN_INVALID');
  });

  it('만료된 토큰은 UnauthorizedError(TOKEN_INVALID)를 next에 전달', () => {
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: 'user-1' },
      process.env.JWT_SECRET,
      { expiresIn: -1 }
    );
    const { req, res } = mockReqRes(`Bearer ${expiredToken}`);
    const next = jest.fn();

    authenticate(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.code).toBe('TOKEN_INVALID');
  });

  it('유효한 토큰은 req.user에 페이로드를 주입하고 next()를 에러 없이 호출', () => {
    const payload = { userId: 'user-abc', email: 'test@example.com' };
    const token = signToken(payload);
    const { req, res } = mockReqRes(`Bearer ${token}`);
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(payload.userId);
    expect(req.user.email).toBe(payload.email);
  });
});
