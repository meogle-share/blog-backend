import { CommonErrorCode } from './common-error-code';
import { ApplicationException, isResolvableException } from './exception.base';
import { ValidationException } from './exceptions';

describe('예외 계층', () => {
  it('ApplicationException은 Error를 상속하고 ResolvableException을 구현한다', () => {
    const exception = new ValidationException();
    expect(exception).toBeInstanceOf(ApplicationException);
    expect(exception).toBeInstanceOf(Error);
    expect(isResolvableException(exception)).toBe(true);
  });

  it('name이 클래스명과 일치한다', () => {
    const exception = new ValidationException();
    expect(exception.name).toBe('ValidationException');
  });
});

describe('ValidationException', () => {
  it('VALIDATION_ERROR 코드를 가진다', () => {
    const exception = new ValidationException({ message: 'invalid input' });

    expect(exception.code).toBe(CommonErrorCode.VALIDATION_ERROR);
    expect(exception.message).toBe('invalid input');
  });

  it('기본 메시지를 가진다', () => {
    const exception = new ValidationException();
    expect(exception.message).toBe('Validation failed');
  });

  it('metadata를 포함할 수 있다', () => {
    const metadata = { field: 'title', min: 1, max: 300 };
    const exception = new ValidationException({ metadata });

    expect(exception.metadata).toEqual(metadata);
  });
});
