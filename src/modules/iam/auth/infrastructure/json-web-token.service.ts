import { ITokenService } from '@modules/iam/auth/domain/token.service.interface';
import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JwtAccessTokenInput,
  JwtAccessTokenPayload,
} from '@modules/iam/auth/infrastructure/types/json-web-token.interface';
import { TokenInfo } from '@common/types/token.interface';

@Injectable()
export class JsonWebTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generate(account: Account): string {
    return this.jwtService.sign<JwtAccessTokenInput>({
      sub: account.id.value,
      username: account.getProps().username.value,
    });
  }

  verify(token: string): TokenInfo | null {
    try {
      const validateToken = this.jwtService.verify<JwtAccessTokenPayload>(token);
      return {
        username: validateToken.username,
        expiresAt: new Date(validateToken.exp * 1000),
      };
    } catch {
      return null;
    }
  }
}
