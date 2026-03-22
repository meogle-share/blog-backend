import { Test } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { WinstonLogger } from './logger.winston';

describe('WinstonLogger', () => {
  let logger: WinstonLogger;
  let mockWinston: jest.Mocked<Pick<Logger, 'info' | 'error' | 'warn' | 'debug'>>;

  beforeEach(async () => {
    mockWinston = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [WinstonLogger, { provide: WINSTON_MODULE_PROVIDER, useValue: mockWinston }],
    }).compile();

    logger = module.get(WinstonLogger);
  });

  it('log()는 winston.info()로 위임한다', () => {
    logger.log('테스트 메시지');

    expect(mockWinston.info).toHaveBeenCalledWith('테스트 메시지');
  });

  it('error()는 winston.error()로 위임하고 trace를 포함한다', () => {
    const trace = new Error('에러 발생');

    logger.error('에러 메시지', trace);

    expect(mockWinston.error).toHaveBeenCalledWith('에러 메시지', { trace });
  });

  it('error()는 trace 없이 호출할 수 있다', () => {
    logger.error('에러 메시지');

    expect(mockWinston.error).toHaveBeenCalledWith('에러 메시지', {
      trace: undefined,
    });
  });

  it('warn()은 winston.warn()으로 위임한다', () => {
    logger.warn('경고 메시지');

    expect(mockWinston.warn).toHaveBeenCalledWith('경고 메시지');
  });

  it('debug()는 winston.debug()로 위임한다', () => {
    logger.debug('디버그 메시지');

    expect(mockWinston.debug).toHaveBeenCalledWith('디버그 메시지');
  });
});
