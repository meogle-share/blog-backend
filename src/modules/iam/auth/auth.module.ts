import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AuthHttpController } from '@modules/iam/auth/presentation/auth.http.controller';
import { LoginUseCase } from '@modules/iam/auth/application/login.usecase';
import { LocalStrategy } from '@modules/iam/auth/infrastructure/strategies/local.strategy';
import { AccountRepositoryImpl } from '@modules/iam/auth/infrastructure/account.repository.impl';
import { AccountMapper } from '@modules/iam/auth/infrastructure/account.mapper';
import { ACCOUNT_REPOSITORY } from '@modules/iam/auth/domain/account.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel]), PassportModule],
  controllers: [AuthHttpController],
  providers: [
    LoginUseCase,
    LocalStrategy,
    AccountMapper,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepositoryImpl,
    },
  ],
})
export class AuthModule {}
