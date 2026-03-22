import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from '@configs/env.validator';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { SeedLoadTestCommand } from './seed-load-test.command';
import { SeedLoadTestService } from './seed-load-test.service';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PostModel } from '@modules/content/post/infrastructure/post.model';
import { appEnv } from '@configs/env';

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
    TypeOrmModule.forFeature([PasswordCredentialModel, UserModel, PostModel]),
  ],
  providers: [SeedLoadTestCommand, SeedLoadTestService],
})
export class CommandsModule {}
