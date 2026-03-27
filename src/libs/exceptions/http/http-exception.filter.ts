import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { LOGGER } from '@libs/log/log.tokens';
import type { LoggerPort } from '@libs/log/logger.port';
import { isResolvableException } from '@libs/exceptions';
import { ExceptionResolver } from '@libs/exceptions';
import { HttpErrorResponse } from '@libs/exceptions';
import { toHttpStatus } from '@libs/exceptions';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private static readonly MASKED_MESSAGE = 'Internal server error';

  constructor(
    @Inject(LOGGER) private readonly logger: LoggerPort,
    private readonly exceptionResolver: ExceptionResolver,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const resolved = this.exceptionResolver.resolve(exception);
    const statusCode = this.resolveHttpStatus(exception, resolved.code);

    const errorResponse = new HttpErrorResponse({
      statusCode,
      code: resolved.code,
      message: statusCode >= 500 ? HttpExceptionFilter.MASKED_MESSAGE : resolved.message,
      metadata: resolved.metadata,
    });

    if (statusCode >= 500) {
      this.logger.error(String(exception), exception);
    } else {
      this.logger.warn(`[${errorResponse.code}] ${errorResponse.message}`);
    }

    response.status(statusCode).json(errorResponse);
  }

  private resolveHttpStatus(exception: unknown, code: string): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    const mapped = toHttpStatus(code);
    if (mapped !== HttpStatus.INTERNAL_SERVER_ERROR) {
      return mapped;
    }

    if (isResolvableException(exception)) {
      this.logger.warn(
        `No HTTP status mapping for ExceptionCode "${code}". ` +
          `Add a mapping in http-status.map.ts`,
      );
    }

    return mapped;
  }
}
