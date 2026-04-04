import { Test } from '@nestjs/testing';
import { ResolveTokenUserUseCase } from './resolve-token-user.usecase';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';

describe('ResolveTokenUserUseCase', () => {
  let useCase: ResolveTokenUserUseCase;
  let userRepository: { findOneById: jest.Mock };

  beforeEach(async () => {
    userRepository = { findOneById: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [ResolveTokenUserUseCase, { provide: USER_REPOSITORY, useValue: userRepository }],
    }).compile();

    useCase = module.get(ResolveTokenUserUseCase);
  });

  it('userId에 해당하는 User를 반환한다', async () => {
    const user = User.from({
      id: '01912345-6789-7abc-8def-bbbbbbbbbbbb',
      props: {
        accountId: '01912345-6789-7abc-8def-0123456789ab',
        nickname: UserNickName.from('testuser'),
        email: null,
      },
    });
    userRepository.findOneById.mockResolvedValue(user);

    const result = await useCase.execute(user.id);

    expect(result).toBe(user);
    expect(userRepository.findOneById).toHaveBeenCalledWith(user.id);
  });

  it('User가 존재하지 않으면 InvalidCredentialsException을 던진다', async () => {
    userRepository.findOneById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(InvalidCredentialsException);
  });
});
