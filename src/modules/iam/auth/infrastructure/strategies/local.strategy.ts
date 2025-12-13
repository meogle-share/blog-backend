import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { SignInUseCase } from '@modules/iam/auth/application/sign-in.use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly loginUseCase: SignInUseCase) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string) {
    return await this.loginUseCase.execute({ username, password });
  }
}
