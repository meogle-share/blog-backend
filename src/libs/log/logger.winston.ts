import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LoggerPort } from './logger.port';

@Injectable()
export class WinstonLogger implements LoggerPort {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly winston: Logger) {}

  log(message: string, ...meta: unknown[]): void {
    this.winston.info(message, ...meta);
  }

  error(message: string, trace?: unknown, ...meta: unknown[]): void {
    this.winston.error(message, { trace, ...meta });
  }

  warn(message: string, ...meta: unknown[]): void {
    this.winston.warn(message, ...meta);
  }

  debug(message: string, ...meta: unknown[]): void {
    this.winston.debug(message, ...meta);
  }
}
