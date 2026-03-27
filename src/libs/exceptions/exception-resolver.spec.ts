import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionResolver } from './exception-resolver';
import { CommonErrorCode } from './common-error-code';
import { ContentErrorCode } from '@modules/content/error-codes';
import { InternalException, ValidationException } from './exceptions';
import { DomainException } from './exception.base';

class TestDomainException extends DomainException {
  constructor() {
    super({ code: ContentErrorCode.INVALID_POST, message: 'Test domain error' });
  }
}

describe('ExceptionResolver', () => {
  let resolver: ExceptionResolver;

  beforeEach(() => {
    resolver = new ExceptionResolver();
  });

  describe('ResolvableException 처리', () => {
    it('ApplicationException의 code, message, metadata를 추출한다', () => {
      const exception = new ValidationException({
        message: 'invalid input',
        metadata: { field: 'title' },
      });

      const result = resolver.resolve(exception);

      expect(result).toEqual({
        code: CommonErrorCode.VALIDATION_ERROR,
        message: 'invalid input',
        metadata: { field: 'title' },
      });
    });

    it('InternalException의 code, message를 추출한다', () => {
      const exception = new InternalException('User not found for OAuth account');

      const result = resolver.resolve(exception);

      expect(result).toEqual({
        code: CommonErrorCode.INTERNAL_ERROR,
        message: 'User not found for OAuth account',
        metadata: undefined,
      });
    });

    it('DomainException의 code, message를 추출한다', () => {
      const result = resolver.resolve(new TestDomainException());

      expect(result).toEqual({
        code: ContentErrorCode.INVALID_POST,
        message: 'Test domain error',
        metadata: undefined,
      });
    });
  });

  describe('NestJS HttpException 처리', () => {
    it('HTTP status를 ExceptionCode로 매핑한다', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);

      const result = resolver.resolve(exception);

      expect(result).toEqual({
        code: CommonErrorCode.VALIDATION_ERROR,
        message: 'Bad Request',
      });
    });

    it('message 배열을 join한다', () => {
      const exception = new HttpException(
        { message: ['field1 is required', 'field2 must be a string'] },
        HttpStatus.BAD_REQUEST,
      );

      const result = resolver.resolve(exception);

      expect(result.message).toBe('field1 is required, field2 must be a string');
    });

    it('매핑되지 않은 status는 INTERNAL_ERROR로 변환한다', () => {
      const exception = new HttpException('Teapot', 418);

      const result = resolver.resolve(exception);

      expect(result.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('알 수 없는 예외 처리', () => {
    it('plain Error를 INTERNAL_ERROR로 변환한다', () => {
      const result = resolver.resolve(new Error('DB connection failed'));

      expect(result).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    });

    it('null을 INTERNAL_ERROR로 변환한다', () => {
      const result = resolver.resolve(null);

      expect(result).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      });
    });
  });
});
