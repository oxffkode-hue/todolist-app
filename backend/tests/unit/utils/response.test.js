'use strict';

const { successResponse, errorResponse } = require('../../../src/utils/response.utils');

describe('응답 유틸리티', () => {
  describe('successResponse', () => {
    it('status가 "success"로 설정됨', () => {
      const res = successResponse({ id: 1 });
      expect(res.status).toBe('success');
    });

    it('data 필드가 전달한 값으로 설정됨', () => {
      const data = { id: 'abc', name: '테스트' };
      const res = successResponse(data);
      expect(res.data).toEqual(data);
    });

    it('timestamp 필드가 ISO 8601 형식의 문자열임', () => {
      const res = successResponse({});
      expect(typeof res.timestamp).toBe('string');
      expect(() => new Date(res.timestamp)).not.toThrow();
    });

    it('message를 전달하면 응답에 포함됨', () => {
      const res = successResponse({}, '생성 완료');
      expect(res.message).toBe('생성 완료');
    });

    it('message를 전달하지 않으면 응답에 포함되지 않음', () => {
      const res = successResponse({ id: 1 });
      expect(res).not.toHaveProperty('message');
    });

    it('data가 null이어도 정상 응답 반환', () => {
      const res = successResponse(null);
      expect(res.status).toBe('success');
      expect(res.data).toBeNull();
    });
  });

  describe('errorResponse', () => {
    it('status가 "error"로 설정됨', () => {
      const res = errorResponse('NOT_FOUND', '리소스 없음');
      expect(res.status).toBe('error');
    });

    it('code와 message 필드가 올바르게 설정됨', () => {
      const res = errorResponse('CONFLICT', '이미 존재합니다');
      expect(res.code).toBe('CONFLICT');
      expect(res.message).toBe('이미 존재합니다');
    });

    it('timestamp 필드가 ISO 8601 형식의 문자열임', () => {
      const res = errorResponse('ERR', 'error');
      expect(typeof res.timestamp).toBe('string');
      expect(() => new Date(res.timestamp)).not.toThrow();
    });

    it('data 필드를 포함하지 않음', () => {
      const res = errorResponse('ERR', 'error');
      expect(res).not.toHaveProperty('data');
    });
  });
});
