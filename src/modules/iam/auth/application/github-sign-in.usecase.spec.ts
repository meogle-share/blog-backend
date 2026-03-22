import { Test } from '@nestjs/testing';
import { GitHubSignInUseCase } from './github-sign-in.usecase';
import { OAUTH_ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { AccountProvider, Provider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';

describe('GitHubSignInUseCase', () => {
  let useCase: GitHubSignInUseCase;
  let oauthAccountRepository: { findOneByProviderAndId: jest.Mock; save: jest.Mock };
  let userRepository: { findOneById: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    oauthAccountRepository = {
      findOneByProviderAndId: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOneById: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        GitHubSignInUseCase,
        { provide: OAUTH_ACCOUNT_REPOSITORY, useValue: oauthAccountRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    useCase = module.get(GitHubSignInUseCase);
  });

  it('기존 GitHub 계정이 있으면 해당 유저를 반환한다', async () => {
    const existingUser = User.from({
      id: '01912345-6789-7abc-8def-0123456789ab',
      props: {
        nickname: UserNickName.from('octocat'),
        email: null,
      },
    });
    const existingOAuth = OAuthAccount.from({
      id: '01912345-6789-7abc-8def-aaaaaaaaaaaa',
      props: {
        userId: existingUser.id,
        provider: AccountProvider.from(Provider.GITHUB),
        providerAccountId: ProviderId.from('12345'),
        providerLogin: 'octocat',
      },
    });
    oauthAccountRepository.findOneByProviderAndId.mockResolvedValue(existingOAuth);
    userRepository.findOneById.mockResolvedValue(existingUser);

    const result = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(result).toBe(existingUser);
    expect(oauthAccountRepository.save).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('신규 GitHub 사용자이면 유저와 OAuth 계정을 생성한다', async () => {
    oauthAccountRepository.findOneByProviderAndId.mockResolvedValue(null);
    userRepository.save.mockImplementation((user: User) => user);
    oauthAccountRepository.save.mockImplementation((account: OAuthAccount) => account);

    const result = await useCase.execute({ githubId: '99999', login: 'newuser' });

    expect(result).toBeInstanceOf(User);
    expect(result.getProps().nickname.value).toBe('newuser');
    expect(result.getProps().email).toBeNull();
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(oauthAccountRepository.save).toHaveBeenCalledTimes(1);
  });

  it('GitHub login의 하이픈을 제거하여 닉네임을 생성한다', async () => {
    oauthAccountRepository.findOneByProviderAndId.mockResolvedValue(null);
    userRepository.save.mockImplementation((user: User) => user);
    oauthAccountRepository.save.mockImplementation((account: OAuthAccount) => account);

    await useCase.execute({ githubId: '11111', login: 'my-cool-name' });

    const savedUser = userRepository.save.mock.calls[0][0] as User;
    expect(savedUser.getProps().nickname.value).toBe('mycoolname');
  });
});
