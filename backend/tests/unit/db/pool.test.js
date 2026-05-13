'use strict';

jest.mock('../../../src/config/env.config', () => ({
  postgresConnectionString: 'postgresql://test:test@localhost:5432/test_db',
  port: 3000,
  nodeEnv: 'test',
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  bcryptSaltRounds: 12,
  corsOrigin: 'http://localhost:5173',
}));

describe('DB Pool (pool.js)', () => {
  let mockRelease;
  let mockConnect;
  let mockOn;
  let MockPool;

  beforeEach(() => {
    jest.resetModules();
    mockRelease = jest.fn();
    mockConnect = jest.fn().mockResolvedValue({ release: mockRelease });
    mockOn = jest.fn();
    MockPool = jest.fn().mockImplementation(() => ({
      connect: mockConnect,
      on: mockOn,
    }));
    jest.doMock('pg', () => ({ Pool: MockPool }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('1. Pool 생성 확인 — new Pool()이 connectionString을 포함한 옵션으로 호출됨', () => {
    require('../../../src/db/pool');

    expect(MockPool).toHaveBeenCalledTimes(1);
    expect(MockPool).toHaveBeenCalledWith({
      connectionString: 'postgresql://test:test@localhost:5432/test_db',
    });
  });

  it('2. error 이벤트 핸들러 등록 — pool.on("error", handler)가 등록됨', () => {
    require('../../../src/db/pool');

    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('2-1. error 핸들러 호출 시 console.error로 메시지를 출력함', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    require('../../../src/db/pool');

    // mockOn의 첫 번째 호출에서 등록된 핸들러를 꺼내 직접 실행
    const [eventName, errorHandler] = mockOn.mock.calls[0];
    expect(eventName).toBe('error');

    const fakeError = new Error('unexpected disconnect');
    errorHandler(fakeError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[DB] Unexpected pool error:',
      'unexpected disconnect'
    );
  });

  it('3. connectPool() 성공 — connect() 호출 → release() 호출 → "[DB] DB connected" 로그 출력', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const { connectPool } = require('../../../src/db/pool');
    await connectPool();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockRelease).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('[DB] DB connected');
  });

  it('4. connectPool() 실패 — connect()가 reject할 때 에러를 throw함', async () => {
    const connectionError = new Error('ECONNREFUSED');
    mockConnect.mockRejectedValueOnce(connectionError);

    const { connectPool } = require('../../../src/db/pool');

    await expect(connectPool()).rejects.toThrow('ECONNREFUSED');
    expect(mockRelease).not.toHaveBeenCalled();
  });
});
