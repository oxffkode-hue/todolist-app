'use strict';

beforeAll(() => {
  process.env.BCRYPT_SALT_ROUNDS = '4'; // 테스트 속도를 위해 낮은 라운드 사용
});

const { hashPassword, comparePassword } = require('../../../src/utils/password.utils');

describe('비밀번호 유틸리티', () => {
  describe('hashPassword', () => {
    it('평문 비밀번호를 해시 문자열로 변환함', async () => {
      const hash = await hashPassword('Password1!');
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe('Password1!');
    });

    it('동일한 평문이라도 매번 다른 해시를 생성함 (salt 적용)', async () => {
      const hash1 = await hashPassword('Password1!');
      const hash2 = await hashPassword('Password1!');
      expect(hash1).not.toBe(hash2);
    });

    it('bcrypt 형식($2b$)의 해시를 생성함', async () => {
      const hash = await hashPassword('Password1!');
      expect(hash.startsWith('$2b$')).toBe(true);
    });
  });

  describe('comparePassword', () => {
    it('평문과 해시가 일치하면 true를 반환함 (왕복 테스트)', async () => {
      const plain = 'MySecurePass1';
      const hash = await hashPassword(plain);
      const result = await comparePassword(plain, hash);
      expect(result).toBe(true);
    });

    it('평문과 해시가 불일치하면 false를 반환함', async () => {
      const hash = await hashPassword('CorrectPassword1');
      const result = await comparePassword('WrongPassword1', hash);
      expect(result).toBe(false);
    });

    it('빈 문자열 평문과 유효한 해시는 false를 반환함', async () => {
      const hash = await hashPassword('Password1!');
      const result = await comparePassword('', hash);
      expect(result).toBe(false);
    });
  });
});
