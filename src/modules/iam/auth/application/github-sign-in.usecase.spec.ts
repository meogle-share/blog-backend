import { Test } from '@nestjs/testing';
import { GitHubSignInUseCase } from './github-sign-in.usecase';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { Account } from '../domain/models/account.aggregate';
import { AccountProvider, Provider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';
import { OAuthAccount } from '../domain/models/oauth-account.entity';

describe('GitHubSignInUseCase', () => {
  let useCase: GitHubSignInUseCase;
  let accountRepository: {
    findOneByProviderAndProviderId: jest.Mock;
    save: jest.Mock;
  };
  let userRepository: { findOneByAccountId: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    accountRepository = {
      findOneByProviderAndProviderId: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOneByAccountId: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GitHubSignInUseCase,
        { provide: ACCOUNT_REPOSITORY, useValue: accountRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(GitHubSignInUseCase);
  });

  it('기존 GitHub 계정이 있으면 해당 유저를 반환한다', async () => {
    const existingAccount = Account.from({
      id: '01912345-6789-7abc-8def-0123456789ab',
      props: {
        oauthAccounts: [
          OAuthAccount.from({
            id: '01912345-6789-7abc-8def-aaaaaaaaaaaa',
            props: {
              provider: AccountProvider.from(Provider.GITHUB),
              providerAccountId: ProviderId.from('12345'),
              providerLogin: 'octocat',
            },
          }),
        ],
        passwordCredential: null,
      },
    });
    const existingUser = User.from({
      id: '01912345-6789-7abc-8def-bbbbbbbbbbbb',
      props: {
        accountId: existingAccount.id,
        nickname: UserNickName.from('octocat'),
        email: null,
      },
    });
    accountRepository.findOneByProviderAndProviderId.mockResolvedValue(existingAccount);
    userRepository.findOneByAccountId.mockResolvedValue(existingUser);

    const result = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(result).toBe(existingUser);
    expect(accountRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('신규 GitHub 사용자이면 Account와 User를 생성한다', async () => {
    accountRepository.findOneByProviderAndProviderId.mockResolvedValue(null);
    accountRepository.save.mockImplementation((account: Account) => account);
    userRepository.save.mockImplementation((user: User) => user);

    const result = await useCase.execute({ githubId: '99999', login: 'newuser' });

    expect(result).toBeInstanceOf(User);
    expect(result.getProps().nickname.value).toBe('newuser');
    expect(result.getProps().email).toBeNull();
    expect(accountRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('GitHub login의 하이픈을 제거하여 닉네임을 생성한다', async () => {
    accountRepository.findOneByProviderAndProviderId.mockResolvedValue(null);
    accountRepository.save.mockImplementation((account: Account) => account);
    userRepository.save.mockImplementation((user: User) => user);

    await useCase.execute({ githubId: '11111', login: 'my-cool-name' });

    const savedUser = userRepository.save.mock.calls[0][0] as User;
    expect(savedUser.getProps().nickname.value).toBe('mycoolname');
  });
});
