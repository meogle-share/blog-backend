import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import type { JwtAccessTokenInput } from '@modules/iam/auth/infrastructure/types/json-web-token.interface';

export const loginAs = (app: INestApplication, user: UserModel): string => {
  const jwtService = app.get(JwtService);

  return jwtService.sign({
    sub: user.id,
    email: user.email ?? null,
    accountType: 'user',
  } satisfies JwtAccessTokenInput);
};
