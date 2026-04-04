import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { JwtAccessTokenPayload } from '../types/json-web-token.interface';
import { createJwtConfig } from '../jwt.config';
import { ResolveTokenUserUseCase } from '../../application/resolve-token-user.usecase';

function extractFromCookie(req: Request): string | null {
  const token: unknown = req.cookies?.access_token;
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly resolveTokenUser: ResolveTokenUserUseCase,
  ) {
    const { secret, issuer } = createJwtConfig(configService);

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: secret,
      issuer,
    });
  }

  async validate(payload: JwtAccessTokenPayload) {
    return this.resolveTokenUser.execute(payload.sub);
  }
}
