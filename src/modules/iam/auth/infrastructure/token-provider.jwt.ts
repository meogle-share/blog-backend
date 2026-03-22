import { TokenProvider, TokenInfo } from '../domain/ports/token-provider.port';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenInput, JwtAccessTokenPayload } from './types/json-web-token.interface';

@Injectable()
export class TokenProviderJwt implements TokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  generate(user: User): string {
    return this.jwtService.sign<JwtAccessTokenInput>({
      sub: user.id,
      email: user.getProps().email?.value ?? null,
      accountType: 'user',
    });
  }

  verify(token: string): TokenInfo | null {
    try {
      const validateToken = this.jwtService.verify<JwtAccessTokenPayload>(token);
      return {
        email: validateToken.email,
        accountType: validateToken.accountType ?? 'user',
        expiresAt: new Date(validateToken.exp * 1000),
      };
    } catch {
      return null;
    }
  }
}
