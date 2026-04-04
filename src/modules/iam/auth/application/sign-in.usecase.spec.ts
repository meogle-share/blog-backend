import { Test } from '@nestjs/testing';
import { SignInUseCase } from './sign-in.usecase';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { PasswordService } from '../domain/services/password.service';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { Account } from '../domain/models/account.aggregate';
import { PasswordCredential } from '../domain/models/password-credential.entity';
import { AccountHashedPassword } from '../domain/models/account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';

describe('SignInUseCase', () => {
  let useCase: SignInUseCase;
  let accountRepository: { findOneByEmail: jest.Mock };
  let userRepository: { findOneByAccountId: jest.Mock };
  let passwordService: { verifyPassword: jest.Mock };

  const accountId = '01912345-6789-7abc-8def-0123456789ab';

  function createAccountWithPassword(): Account {
    return Account.from({
      id: accountId,
      props: {
        oauthAccounts: [],
        passwordCredential: PasswordCredential.from({
          id: '01912345-6789-7abc-8def-aaaaaaaaaaaa',
          props: {
            email: UserEmail.from('test@example.com'),
            hashedPassword: AccountHashedPassword.from('hashed-password'),
          },
        }),
      },
    });
  }

  function createUser(): User {
    return User.from({
      id: '01912345-6789-7abc-8def-bbbbbbbbbbbb',
      props: {
        accountId,
        nickname: UserNickName.from('testuser'),
        email: UserEmail.from('test@example.com'),
      },
    });
  }

  beforeEach(async () => {
    accountRepository = { findOneByEmail: jest.fn() };
    userRepository = { findOneByAccountId: jest.fn() };
    passwordService = { verifyPassword: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        SignInUseCase,
        { provide: ACCOUNT_REPOSITORY, useValue: accountRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    useCase = module.get(SignInUseCase);
  });

  it('이메일과 비밀번호가 일치하면 User를 반환한다', async () => {
    const account = createAccountWithPassword();
    const user = createUser();
    accountRepository.findOneByEmail.mockResolvedValue(account);
    passwordService.verifyPassword.mockResolvedValue(true);
    userRepository.findOneByAccountId.mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'correct-password',
    });

    expect(result).toBe(user);
    expect(passwordService.verifyPassword).toHaveBeenCalledWith(
      'correct-password',
      AccountHashedPassword.from('hashed-password'),
    );
  });

  it('이메일에 해당하는 Account가 없으면 InvalidCredentialsException을 던진다', async () => {
    accountRepository.findOneByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'any' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('비밀번호 credential이 없는 Account이면 InvalidCredentialsException을 던진다', async () => {
    const oauthOnlyAccount = Account.from({
      id: accountId,
      props: { oauthAccounts: [], passwordCredential: null },
    });
    accountRepository.findOneByEmail.mockResolvedValue(oauthOnlyAccount);

    await expect(useCase.execute({ email: 'test@example.com', password: 'any' })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('비밀번호가 일치하지 않으면 InvalidCredentialsException을 던진다', async () => {
    accountRepository.findOneByEmail.mockResolvedValue(createAccountWithPassword());
    passwordService.verifyPassword.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('Account는 있지만 User가 없으면 InvalidCredentialsException을 던진다', async () => {
    accountRepository.findOneByEmail.mockResolvedValue(createAccountWithPassword());
    passwordService.verifyPassword.mockResolvedValue(true);
    userRepository.findOneByAccountId.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'correct-password' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
