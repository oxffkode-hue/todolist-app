'use strict';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-min-32-chars-long-here!!';
  process.env.JWT_EXPIRES_IN = '1h';
});

const { signToken, verifyToken } = require('../../../src/utils/jwt.utils');

describe('JWT 유틸리티', () => {
  describe('signToken', () => {
    it('페이로드를 받아 JWT 문자열을 반환함', () => {
      const token = signToken({ userId: 'user-1', email: 'test@example.com' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('서로 다른 페이로드는 서로 다른 토큰을 생성함', () => {
      const token1 = signToken({ userId: 'user-1' });
      const token2 = signToken({ userId: 'user-2' });
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('signToken으로 생성한 토큰을 검증하고 페이로드를 반환함 (왕복 테스트)', () => {
      const payload = { userId: 'user-abc', email: 'hello@example.com' };
      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('변조된 토큰은 에러를 throw함', () => {
      const token = signToken({ userId: 'user-1' });
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyToken(tampered)).toThrow();
    });

    it('잘못된 형식의 토큰은 에러를 throw함', () => {
      expect(() => verifyToken('not.a.valid.token')).toThrow();
    });

    it('빈 문자열 토큰은 에러를 throw함', () => {
      expect(() => verifyToken('')).toThrow();
    });

    it('만료된 토큰은 에러를 throw함', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'user-1' },
        process.env.JWT_SECRET,
        { expiresIn: -1 }
      );
      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });
});
