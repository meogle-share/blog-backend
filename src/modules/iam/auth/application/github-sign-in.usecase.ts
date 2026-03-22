import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@libs/ddd';
import type { OAuthAccountRepositoryPort } from '../domain/ports/oauth-account.repository.port';
import type { UserRepositoryPort } from '@modules/iam/user/domain/ports/user.repository.port';
import { OAUTH_ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { AccountProvider, Provider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';

interface GitHubSignInCommand {
  githubId: string;
  login: string;
}

@Injectable()
export class GitHubSignInUseCase implements UseCase<GitHubSignInCommand, User> {
  constructor(
    @Inject(OAUTH_ACCOUNT_REPOSITORY)
    private readonly oauthAccountRepository: OAuthAccountRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: GitHubSignInCommand): Promise<User> {
    const existing = await this.oauthAccountRepository.findOneByProviderAndId(
      Provider.GITHUB,
      command.githubId,
    );

    if (existing) {
      const user = await this.userRepository.findOneById(existing.getProps().userId);
      return user!;
    }

    const nickname = UserNickName.from(command.login.replace(/-/g, ''));
    const user = User.create({ nickname, email: null });
    const savedUser = await this.userRepository.save(user);

    const oauthAccount = OAuthAccount.create({
      userId: savedUser.id,
      provider: AccountProvider.from(Provider.GITHUB),
      providerAccountId: ProviderId.from(command.githubId),
      providerLogin: command.login,
    });
    await this.oauthAccountRepository.save(oauthAccount);

    return savedUser;
  }
}
