import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PasswordCredentialModel } from './infrastructure/password-credential.model';
import { OAuthAccountModel } from './infrastructure/oauth-account.model';
import { AuthHttpController } from './presentation/auth.http.controller';
import { SignInUseCase } from './application/sign-in.usecase';
import { GitHubSignInUseCase } from './application/github-sign-in.usecase';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GithubStrategy } from './infrastructure/strategies/github.strategy';
import { PasswordCredentialRepository } from './infrastructure/password-credential.repository';
import { OAuthAccountRepository } from './infrastructure/oauth-account.repository';
import { PasswordCredentialMapper } from './infrastructure/password-credential.mapper';
import { OAuthAccountMapper } from './infrastructure/oauth-account.mapper';
import {
  OAUTH_ACCOUNT_REPOSITORY,
  PASSWORD_CREDENTIAL_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_PROVIDER,
} from './auth.tokens';
import { TokenProviderJwt } from './infrastructure/token-provider.jwt';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './domain/services/password.service';
import { PasswordHasherArgon2 } from './infrastructure/password-hasher.argon2';
import { UserModule } from '@modules/iam/user/user.module';

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
    TypeOrmModule.forFeature([PasswordCredentialModel, OAuthAccountModel]),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthHttpController],
  providers: [
    SignInUseCase,
    GitHubSignInUseCase,
    PasswordService,
    LocalStrategy,
    GithubStrategy,
    PasswordCredentialMapper,
    OAuthAccountMapper,
    {
      provide: PASSWORD_CREDENTIAL_REPOSITORY,
      useClass: PasswordCredentialRepository,
    },
    {
      provide: OAUTH_ACCOUNT_REPOSITORY,
      useClass: OAuthAccountRepository,
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
