import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { ExceptionResolver } from '../exception-resolver';
import { CommonErrorCode } from '../common-error-code';
import { ContentErrorCode } from '@modules/content/error-codes';
import { DomainException } from '../exception.base';
import { ValidationException } from '../exceptions';
import type { LoggerPort } from '@libs/log/logger.port';

class TestDomainException extends DomainException {
  constructor() {
    super({ code: ContentErrorCode.INVALID_POST, message: 'Invalid post title' });
  }
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockLogger: jest.Mocked<LoggerPort>;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
    const resolver = new ExceptionResolver();
    filter = new HttpExceptionFilter(mockLogger, resolver);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  describe('ApplicationException 처리', () => {
    it('ValidationException을 400으로 변환한다', () => {
      const exception = new ValidationException({
        message: 'invalid input',
        metadata: { field: 'title' },
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          code: CommonErrorCode.VALIDATION_ERROR,
          message: 'invalid input',
          metadata: { field: 'title' },
        }),
      );
    });

    it('응답에 timestamp를 포함한다', () => {
      const exception = new ValidationException();

      filter.catch(exception, mockHost);

      const response = mockResponse.json.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();
      expect(() => new Date(response.timestamp)).not.toThrow();
    });
  });

  describe('DomainException 처리', () => {
    it('DomainException을 매핑된 HTTP status로 변환한다', () => {
      const exception = new TestDomainException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          code: ContentErrorCode.INVALID_POST,
          message: 'Invalid post title',
        }),
      );
    });
  });

  describe('NestJS HttpException 처리', () => {
    it('HttpException의 상태코드를 유지하면서 포맷을 통일한다', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          code: CommonErrorCode.VALIDATION_ERROR,
          message: 'Bad Request',
        }),
      );
    });

    it('ValidationPipe 에러의 message 배열을 join한다', () => {
      const exception = new HttpException(
        { message: ['field1 is required', 'field2 must be a string'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'field1 is required, field2 must be a string',
        }),
      );
    });
  });

  describe('알 수 없는 에러 처리', () => {
    it('plain Error를 500으로 변환하고 메시지를 숨긴다', () => {
      const exception = new Error('DB connection failed');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        }),
      );
    });

    it('null/undefined 예외도 500으로 처리한다', () => {
      filter.catch(null, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        }),
      );
    });
  });

  describe('로깅', () => {
    it('500 이상 에러는 logger.error()를 호출한다', () => {
      const exception = new Error('unexpected');

      filter.catch(exception, mockHost);

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('400대 에러는 logger.warn()을 호출한다', () => {
      const exception = new ValidationException();

      filter.catch(exception, mockHost);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `[${CommonErrorCode.VALIDATION_ERROR}] Validation failed`,
      );
    });
  });
});
