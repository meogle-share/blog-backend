import { ApplicationException } from './exception.base';
import { CommonErrorCode } from './common-error-code';

export class ValidationException extends ApplicationException {
  constructor(props?: { message?: string; metadata?: Record<string, unknown> }) {
    super({
      message: props?.message ?? 'Validation failed',
      code: CommonErrorCode.VALIDATION_ERROR,
      metadata: props?.metadata,
    });
  }
}
