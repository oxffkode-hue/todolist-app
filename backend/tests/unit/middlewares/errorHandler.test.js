'use strict';

const {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require('../../../src/errors/AppError');
const { errorHandler } = require('../../../src/middlewares/errorHandler');

function mockRes() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('errorHandler 미들웨어', () => {
  let req, next;

  beforeEach(() => {
    req = {};
    next = jest.fn();
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AppError(400)는 status 400과 code, message를 응답', () => {
    const err = new BadRequestError('잘못된 입력', 'INVALID_INPUT');
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', code: 'INVALID_INPUT', message: '잘못된 입력' })
    );
  });

  it('AppError(404)는 status 404로 응답', () => {
    const err = new NotFoundError('리소스 없음');
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('AppError(401)는 status 401로 응답', () => {
    const err = new UnauthorizedError();
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('일반 Error는 status 500과 INTERNAL_SERVER_ERROR로 응답', () => {
    const err = new Error('DB 연결 오류');
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', code: 'INTERNAL_SERVER_ERROR' })
    );
  });

  it('개발 환경에서 일반 Error 발생 시 console.error를 호출함', () => {
    process.env.NODE_ENV = 'development';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('예상치 못한 오류');
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith(err);
  });

  it('프로덕션 환경에서 일반 Error 발생 시 console.error를 호출하지 않음 (스택 미노출)', () => {
    process.env.NODE_ENV = 'production';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('프로덕션 오류');
    const res = mockRes();

    errorHandler(err, req, res, next);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('응답 body에 stack 필드가 포함되지 않음', () => {
    const err = new Error('스택 노출 금지');
    const res = mockRes();

    errorHandler(err, req, res, next);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('stack');
  });
});
