import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AccountModel } from './infrastructure/account.model';
import { AuthHttpController } from './presentation/auth.http.controller';
import { SignInUseCase } from './application/sign-in.usecase';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { AccountRepositoryImpl } from './infrastructure/account.repository.impl';
import { AccountMapper } from './infrastructure/account.mapper';
import { ACCOUNT_REPOSITORY, PASSWORD_HASHER, TOKEN_PROVIDER } from './auth.tokens';
import { TokenProviderJwt } from './infrastructure/token-provider.jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './domain/services/password.service';
import { PasswordHasherArgon2 } from './infrastructure/password-hasher.argon2';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const issuer = `meogle-${config.get<string>('NODE_ENV')}`;

        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: 300, issuer },
          verifyOptions: { issuer },
        };
      },
    }),
    TypeOrmModule.forFeature([AccountModel]),
    PassportModule,
  ],
  controllers: [AuthHttpController],
  providers: [
    SignInUseCase,
    PasswordService,
    LocalStrategy,
    AccountMapper,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepositoryImpl,
    },
    {
      provide: TOKEN_PROVIDER,
      useClass: TokenProviderJwt,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasherArgon2,
    },
  ],
})
export class AuthModule {}
