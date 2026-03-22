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
        const nodeEnv = configService.get('NODE_ENV');
        const level = nodeEnv === NodeEnvironment.PRODUCTION ? 'info' : 'debug';
        const silent = nodeEnv === NodeEnvironment.TEST;

        return {
          level,
          silent,
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
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
