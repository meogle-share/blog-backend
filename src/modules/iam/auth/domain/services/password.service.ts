import type { PasswordHasher } from '../ports/password-hasher.port';
import { PASSWORD_HASHER } from '../../auth.tokens';
import { Inject, Injectable } from '@nestjs/common';
import { AccountHashedPassword } from '../models/account-hashed-password.vo';

@Injectable()
export class PasswordService {
  constructor(@Inject(PASSWORD_HASHER) private readonly passwordHashService: PasswordHasher) {}

  verifyPassword(inputPassword: string, accountPassword: AccountHashedPassword): Promise<boolean> {
    return this.passwordHashService.compare(inputPassword, accountPassword.value);
  }
}
