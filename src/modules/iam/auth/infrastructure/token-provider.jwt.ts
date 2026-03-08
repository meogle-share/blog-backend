import { TokenProvider, TokenInfo } from '../domain/ports/token-provider.port';
import { UserAccount } from '../domain/models/user-account.aggregate';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenInput, JwtAccessTokenPayload } from './types/json-web-token.interface';

@Injectable()
export class TokenProviderJwt implements TokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  generate(account: UserAccount): string {
    return this.jwtService.sign<JwtAccessTokenInput>({
      sub: account.id,
      username: account.getProps().username.value,
      accountType: 'user',
    });
  }

  verify(token: string): TokenInfo | null {
    try {
      const validateToken = this.jwtService.verify<JwtAccessTokenPayload>(token);
      return {
        username: validateToken.username,
        accountType: validateToken.accountType ?? 'user',
        expiresAt: new Date(validateToken.exp * 1000),
      };
    } catch {
      return null;
    }
  }
}
