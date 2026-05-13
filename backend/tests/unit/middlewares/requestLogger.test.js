'use strict';

const { requestLogger } = require('../../../src/middlewares/requestLogger');

describe('requestLogger 미들웨어', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('next()를 즉시 호출함', () => {
    const req = { method: 'GET', path: '/api/health' };
    const res = { on: jest.fn(), statusCode: 200 };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('res finish 이벤트에 핸들러를 등록함', () => {
    const req = { method: 'GET', path: '/api/health' };
    const res = { on: jest.fn(), statusCode: 200 };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('finish 이벤트 시 [METHOD] /path → statusCode 형식으로 로그 출력', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    let finishHandler;
    const req = { method: 'POST', path: '/api/auth/login' };
    const res = {
      on: jest.fn((event, handler) => {
        if (event === 'finish') finishHandler = handler;
      }),
      statusCode: 201,
    };
    const next = jest.fn();

    requestLogger(req, res, next);
    finishHandler(); // finish 이벤트 수동 트리거

    expect(consoleLogSpy).toHaveBeenCalledWith('[POST] /api/auth/login → 201');
  });

  it('DELETE 요청 404 응답도 올바르게 로그 출력', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    let finishHandler;
    const req = { method: 'DELETE', path: '/api/unknown' };
    const res = {
      on: jest.fn((event, handler) => {
        if (event === 'finish') finishHandler = handler;
      }),
      statusCode: 404,
    };
    const next = jest.fn();

    requestLogger(req, res, next);
    finishHandler();

    expect(consoleLogSpy).toHaveBeenCalledWith('[DELETE] /api/unknown → 404');
  });
});
