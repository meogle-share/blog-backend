import type { IPasswordHashService } from '@modules/iam/auth/domain/password-hash.service.interface';
import { PASSWORD_HASH_SERVICE } from '@modules/iam/auth/domain/password-hash.service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { AccountHashedPassword } from '@modules/iam/auth/domain/value-objects/account-hashed-password.vo';

@Injectable()
export class PasswordService {
  constructor(
    @Inject(PASSWORD_HASH_SERVICE) private readonly passwordHashService: IPasswordHashService,
  ) {}

  verifyPassword(inputPassword: string, accountPassword: AccountHashedPassword): Promise<boolean> {
    return this.passwordHashService.compare(inputPassword, accountPassword.value);
  }
}
