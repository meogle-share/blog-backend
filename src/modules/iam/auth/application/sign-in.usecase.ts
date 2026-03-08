import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AccountRepositoryPort } from '../domain/ports/account.repository.port';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { UserAccount } from '../domain/models/user-account.aggregate';
import { PasswordService } from '../domain/services/password.service';
import { UseCase } from '@libs/ddd';

interface SignInCommand {
  username: string;
  password: string;
}

@Injectable()
export class SignInUseCase implements UseCase<SignInCommand, UserAccount> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: SignInCommand): Promise<UserAccount> {
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
