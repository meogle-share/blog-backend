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
import { TOKEN_SERVICE } from '@modules/iam/auth/domain/token.service.interface';
import { JsonWebTokenService } from '@modules/iam/auth/infrastructure/json-web-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    LoginUseCase,
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
  ],
})
export class AuthModule {}
