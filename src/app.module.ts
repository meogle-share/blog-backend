import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@configs/env.validator';
import { ContentModule } from '@modules/content/content.module';
import { IamModule } from '@modules/iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { appEnv } from '@configs/env';
import { HealthModule } from '@common/health/health.module';
import { LoggerModule } from '@libs/log/logger.module';
import { ExceptionResolver, HttpExceptionFilter } from '@libs/exceptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: `.env.${appEnv.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDataSourceOptionsForNest,
    }),
    LoggerModule,

    // Modules
    HealthModule,
    ContentModule,
    IamModule,
  ],
  providers: [ExceptionResolver, { provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}
