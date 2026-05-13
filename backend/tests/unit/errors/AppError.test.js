'use strict';

const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../../../src/errors/AppError');

describe('AppError 및 서브클래스', () => {
  describe('AppError 기본 동작', () => {
    it('instanceof AppError 판별 가능', () => {
      const err = new AppError(400, 'TEST_CODE', 'test message');
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(Error);
    });

    it('statusCode, code, message 속성이 올바르게 설정됨', () => {
      const err = new AppError(422, 'VALIDATION_ERROR', '검증 오류');
      expect(err.statusCode).toBe(422);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.message).toBe('검증 오류');
    });

    it('name이 클래스명으로 설정됨', () => {
      const err = new AppError(400, 'CODE', 'msg');
      expect(err.name).toBe('AppError');
    });

    it('stack trace가 존재함', () => {
      const err = new AppError(500, 'ERR', 'error');
      expect(err.stack).toBeDefined();
    });
  });

  describe('BadRequestError', () => {
    it('statusCode 400, 기본 code BAD_REQUEST', () => {
      const err = new BadRequestError();
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('BAD_REQUEST');
      expect(err).toBeInstanceOf(AppError);
    });

    it('커스텀 메시지와 코드 설정 가능', () => {
      const err = new BadRequestError('잘못된 요청', 'INVALID_INPUT');
      expect(err.message).toBe('잘못된 요청');
      expect(err.code).toBe('INVALID_INPUT');
    });
  });

  describe('UnauthorizedError', () => {
    it('statusCode 401, 기본 code UNAUTHORIZED', () => {
      const err = new UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
      expect(err).toBeInstanceOf(AppError);
    });

    it('커스텀 메시지 설정 가능', () => {
      const err = new UnauthorizedError('인증 실패');
      expect(err.message).toBe('인증 실패');
    });
  });

  describe('ForbiddenError', () => {
    it('statusCode 403, 기본 code FORBIDDEN', () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
      expect(err).toBeInstanceOf(AppError);
    });
  });

  describe('NotFoundError', () => {
    it('statusCode 404, 기본 code RESOURCE_NOT_FOUND', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('RESOURCE_NOT_FOUND');
      expect(err).toBeInstanceOf(AppError);
    });
  });

  describe('ConflictError', () => {
    it('statusCode 409, 기본 code CONFLICT', () => {
      const err = new ConflictError();
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe('CONFLICT');
      expect(err).toBeInstanceOf(AppError);
    });
  });

  describe('instanceof 계층 구조', () => {
    it('모든 서브클래스가 AppError의 instanceof임', () => {
      expect(new BadRequestError()).toBeInstanceOf(AppError);
      expect(new UnauthorizedError()).toBeInstanceOf(AppError);
      expect(new ForbiddenError()).toBeInstanceOf(AppError);
      expect(new NotFoundError()).toBeInstanceOf(AppError);
      expect(new ConflictError()).toBeInstanceOf(AppError);
    });

    it('서로 다른 서브클래스는 instanceof 교차 불가', () => {
      const err = new BadRequestError();
      expect(err).not.toBeInstanceOf(UnauthorizedError);
      expect(err).not.toBeInstanceOf(NotFoundError);
    });
  });
});
