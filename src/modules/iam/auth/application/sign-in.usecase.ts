import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../domain/ports/account.repository.port';
import type { UserRepositoryPort } from '@modules/iam/user/domain/ports/user.repository.port';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { PasswordService } from '../domain/services/password.service';
import { UseCase } from '@libs/ddd';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

interface SignInCommand {
  email: string;
  password: string;
}

@Injectable()
export class SignInUseCase implements UseCase<SignInCommand, User> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: SignInCommand): Promise<User> {
    const account = await this.accountRepository.findOneByEmail(command.email);
    if (!account) {
      throw new InvalidCredentialsException();
    }

    const credential = account.getProps().passwordCredential;
    if (!credential) {
      throw new InvalidCredentialsException();
    }

    const { hashedPassword } = credential.getProps();
    const isMatched = await this.passwordService.verifyPassword(command.password, hashedPassword);
    if (!isMatched) {
      throw new InvalidCredentialsException();
    }

    const user = await this.userRepository.findOneByAccountId(account.id);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    return user;
  }
}
