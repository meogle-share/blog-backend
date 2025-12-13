import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AuthHttpController } from '@modules/iam/auth/presentation/auth.http.controller';
import { SignInUseCase } from '@modules/iam/auth/application/sign-in.use-case';
import { LocalStrategy } from '@modules/iam/auth/infrastructure/strategies/local.strategy';
import { AccountRepositoryImpl } from '@modules/iam/auth/infrastructure/account.repository.impl';
import { AccountMapper } from '@modules/iam/auth/infrastructure/account.mapper';
import { ACCOUNT_REPOSITORY } from '@modules/iam/auth/domain/account.repository.interface';
import { TOKEN_SERVICE } from '@modules/iam/auth/domain/token.service.interface';
import { JsonWebTokenService } from '@modules/iam/auth/infrastructure/json-web-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from '@modules/iam/auth/domain/services/password.service';
import { PASSWORD_HASH_SERVICE } from '@modules/iam/auth/domain/password-hash.service.interface';
import { BcryptPasswordHashService } from '@modules/iam/auth/infrastructure/bcrypt-password-hash.service';

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
      provide: TOKEN_SERVICE,
      useClass: JsonWebTokenService,
    },
    {
      provide: PASSWORD_HASH_SERVICE,
      useClass: BcryptPasswordHashService,
    },
  ],
})
export class AuthModule {}
