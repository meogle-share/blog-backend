import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IAccountRepository } from '@modules/iam/auth/domain/account.repository.interface';
import { ACCOUNT_REPOSITORY } from '@modules/iam/auth/domain/account.repository.interface';
import { Account } from '@modules/iam/auth/domain/account.aggregate';

interface LoginCommand {
  username: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: LoginCommand): Promise<Account> {
    const account = await this.accountRepository.findOneByUsername(command.username);

    if (!account || !account.verifyPassword(command.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return account;
  }
}
