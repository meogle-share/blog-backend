import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@libs/ddd';
import type { AccountRepositoryPort } from '../domain/ports/account.repository.port';
import type { UserRepositoryPort } from '@modules/iam/user/domain/ports/user.repository.port';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { Account } from '../domain/models/account.aggregate';
import { AccountProvider, Provider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';
import { InternalException } from '@libs/exceptions';

interface GitHubAuthCommand {
  githubId: string;
  login: string;
}

@Injectable()
export class GitHubAuthUseCase implements UseCase<GitHubAuthCommand, User> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: GitHubAuthCommand): Promise<User> {
    const existingAccount = await this.accountRepository.findOneByProviderAndProviderId(
      Provider.GITHUB,
      command.githubId,
    );

    if (existingAccount) {
      return this.findExistingUser(existingAccount);
    }

    return this.registerNewUser(command);
  }

  private async findExistingUser(account: Account): Promise<User> {
    const user = await this.userRepository.findOneByAccountId(account.id);

    if (!user) {
      throw new InternalException(`User not found for account: ${account.id}`);
    }

    return user;
  }

  private async registerNewUser(command: GitHubAuthCommand): Promise<User> {
    const account = Account.createWithOAuth({
      provider: AccountProvider.from(Provider.GITHUB),
      providerAccountId: ProviderId.from(command.githubId),
      providerLogin: command.login,
    });
    const savedAccount = await this.accountRepository.save(account);

    const nickname = UserNickName.from(command.login.replace(/-/g, ''));
    const user = User.create({ accountId: savedAccount.id, nickname, email: null });
    return this.userRepository.save(user);
  }
}
