import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAccountRepository } from '@modules/iam/auth/domain/account.repository.interface';
import { ACCOUNT_REPOSITORY } from '@modules/iam/auth/domain/account.repository.interface';
import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { PasswordService } from '@modules/iam/auth/domain/services/password.service';

interface LoginCommand {
  username: string;
  password: string;
}

@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: LoginCommand): Promise<Account> {
    const account = await this.accountRepository.findOneByUsername(command.username);
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatched = await this.passwordService.verifyPassword(
      command.password,
      account.getProps().password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return account;
  }
}
