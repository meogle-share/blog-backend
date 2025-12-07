import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@configs/env.validator';
import { ContentModule } from '@modules/content/content.module';
import { IamModule } from '@modules/iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { appEnv } from '@configs/env';
import { HealthModule } from '@common/health/health.module';

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

    // Modules
    HealthModule,
    ContentModule,
    IamModule,
  ],
})
export class AppModule {}
