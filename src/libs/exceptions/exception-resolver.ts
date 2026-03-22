import { HttpException, Injectable } from '@nestjs/common';
import { isResolvableException } from './exception.base';
import { CommonErrorCode } from './common-error-code';

export interface ResolvedError {
  code: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ExceptionResolver {
  resolve(exception: unknown): ResolvedError {
    if (isResolvableException(exception)) {
      return {
        code: exception.code,
        message: exception.message,
        metadata: exception.metadata,
      };
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message;

      return {
        code: this.mapHttpStatusToCode(exception.getStatus()),
        message: Array.isArray(message) ? message.join(', ') : String(message),
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };
  }

  private mapHttpStatusToCode(status: number): string {
    const mapping: Record<number, string> = {
      400: CommonErrorCode.VALIDATION_ERROR,
      401: CommonErrorCode.UNAUTHORIZED,
      403: CommonErrorCode.FORBIDDEN,
      404: CommonErrorCode.NOT_FOUND,
      409: CommonErrorCode.CONFLICT,
    };
    return mapping[status] ?? 'INTERNAL_ERROR';
  }
}
