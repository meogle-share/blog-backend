import { Test } from '@nestjs/testing';
import { IssueTokenUseCase } from './issue-token.usecase';
import { TOKEN_PROVIDER } from '../auth.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';

describe('IssueTokenUseCase', () => {
  let useCase: IssueTokenUseCase;
  let tokenProvider: { generate: jest.Mock };

  beforeEach(async () => {
    tokenProvider = { generate: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [IssueTokenUseCase, { provide: TOKEN_PROVIDER, useValue: tokenProvider }],
    }).compile();

    useCase = module.get(IssueTokenUseCase);
  });

  it('User에 대한 accessToken을 발급한다', () => {
    const user = User.from({
      id: '01912345-6789-7abc-8def-0123456789ab',
      props: {
        accountId: '01912345-6789-7abc-8def-aaaaaaaaaaaa',
        nickname: UserNickName.from('testuser'),
        email: null,
      },
    });
    tokenProvider.generate.mockReturnValue('mocked-token');

    const result = useCase.execute({ user });

    expect(result.accessToken).toBe('mocked-token');
    expect(result.user).toBe(user);
    expect(tokenProvider.generate).toHaveBeenCalledWith(user);
  });
});
