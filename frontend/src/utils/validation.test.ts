import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail } from './validation';

describe('validatePassword', () => {
  it('8자 미만이면 에러', () => {
    expect(validatePassword('abc1')).not.toBeNull();
  });

  it('영문자 없으면 에러', () => {
    expect(validatePassword('12345678')).not.toBeNull();
  });

  it('숫자 없으면 에러', () => {
    expect(validatePassword('abcdefgh')).not.toBeNull();
  });

  it('8자 이상 영문+숫자 조합이면 통과', () => {
    expect(validatePassword('pass1234')).toBeNull();
    expect(validatePassword('Test1234!')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('빈 문자열이면 에러', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('@가 없으면 에러', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
  });

  it('올바른 형식이면 통과', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });
});
