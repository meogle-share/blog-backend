import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AccountModel } from './infrastructure/account.model';
import { PasswordCredentialModel } from './infrastructure/password-credential.model';
import { OAuthAccountModel } from './infrastructure/oauth-account.model';
import { AuthHttpController } from './presentation/auth.http.controller';
import { SignInUseCase } from './application/sign-in.usecase';
import { GitHubAuthUseCase } from './application/github-auth.usecase';
import { IssueTokenUseCase } from './application/issue-token.usecase';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GithubStrategy } from './infrastructure/strategies/github.strategy';
import { AccountRepository } from './infrastructure/account.repository';
import { AccountMapper } from './infrastructure/account.mapper';
import { ACCOUNT_REPOSITORY, PASSWORD_HASHER, TOKEN_PROVIDER } from './auth.tokens';
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
    TypeOrmModule.forFeature([AccountModel, OAuthAccountModel, PasswordCredentialModel]),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthHttpController],
  providers: [
    SignInUseCase,
    GitHubAuthUseCase,
    IssueTokenUseCase,
    PasswordService,
    LocalStrategy,
    GithubStrategy,
    AccountMapper,
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: AccountRepository,
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
