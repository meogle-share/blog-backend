import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@configs/env.validator';
import { ContentModule } from '@modules/content/content.module';
import { IamModule } from '@modules/iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Modules
    ContentModule,
    IamModule,
  ],
})
export class AppModule {}
