import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { NodeEnvironment } from '@configs/env.validator';
import { LOGGER } from './log.tokens';
import { WinstonLogger } from './logger.winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === NodeEnvironment.PRODUCTION;

        return {
          level: isProduction ? 'info' : 'debug',
          transports: [
            new winston.transports.Console({
              format: isProduction
                ? winston.format.combine(winston.format.timestamp(), winston.format.json())
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                      const ctx = context ? `[${context}]` : '';
                      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                      return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
                    }),
                  ),
            }),
          ],
        };
      },
    }),
  ],
  providers: [{ provide: LOGGER, useClass: WinstonLogger }],
  exports: [LOGGER],
})
export class LoggerModule {}
