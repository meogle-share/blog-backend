import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubSignInUseCase } from '../application/github-sign-in.usecase';
import { AccountRepository } from '../infrastructure/account.repository';
import { AccountMapper } from '../infrastructure/account.mapper';
import { AccountModel } from '../infrastructure/account.model';
import { OAuthAccountModel } from '../infrastructure/oauth-account.model';
import { PasswordCredentialModel } from '../infrastructure/password-credential.model';
import { UserRepository } from '@modules/iam/user/infrastructure/user.repository';
import { UserMapper } from '@modules/iam/user/infrastructure/user.mapper';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { Provider } from '../domain/models/account-provider.vo';
import { InternalException } from '@libs/exceptions';

describe('GitHubSignInUseCase', () => {
  let useCase: GitHubSignInUseCase;
  let accountModelRepo: Repository<AccountModel>;
  let oauthModelRepo: Repository<OAuthAccountModel>;
  let userModelRepo: Repository<UserModel>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => getDataSourceOptionsForNest(configService),
        }),
        TypeOrmModule.forFeature([
          AccountModel,
          OAuthAccountModel,
          PasswordCredentialModel,
          UserModel,
        ]),
      ],
      providers: [
        {
          provide: ACCOUNT_REPOSITORY,
          useClass: AccountRepository,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserRepository,
        },
        AccountMapper,
        UserMapper,
        GitHubSignInUseCase,
      ],
    }).compile();

    useCase = module.get(GitHubSignInUseCase);
    accountModelRepo = module.get(getRepositoryToken(AccountModel));
    oauthModelRepo = module.get(getRepositoryToken(OAuthAccountModel));
    userModelRepo = module.get(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([oauthModelRepo, userModelRepo, accountModelRepo]);
  });

  afterAll(async () => {
    await truncate([oauthModelRepo, userModelRepo, accountModelRepo]);
    await module.close();
  });

  it('신규 GitHub 사용자이면 Account와 User를 생성한다', async () => {
    const result = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(result).toBeInstanceOf(User);
    expect(result.getProps().nickname.value).toBe('octocat');
    expect(result.getProps().email).toBeNull();

    const savedUser = await userModelRepo.findOneBy({ id: result.id });
    expect(savedUser).toBeDefined();
    expect(savedUser!.accountId).toBeDefined();

    const savedAccount = await accountModelRepo.findOneBy({ id: savedUser!.accountId });
    expect(savedAccount).toBeDefined();

    const savedOAuth = await oauthModelRepo.findOneBy({ accountId: savedAccount!.id });
    expect(savedOAuth).toBeDefined();
    expect(savedOAuth!.provider).toBe(Provider.GITHUB);
    expect(savedOAuth!.providerAccountId).toBe('12345');
  });

  it('GitHub login의 하이픈을 제거하여 닉네임을 생성한다', async () => {
    const result = await useCase.execute({ githubId: '99999', login: 'my-cool-name' });

    expect(result.getProps().nickname.value).toBe('mycoolname');
  });

  it('기존 GitHub 계정이 있으면 해당 유저를 반환한다', async () => {
    const first = await useCase.execute({ githubId: '12345', login: 'octocat' });
    const second = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(second.id).toBe(first.id);

    const accountCount = await accountModelRepo.count();
    expect(accountCount).toBe(1);

    const userCount = await userModelRepo.count();
    expect(userCount).toBe(1);
  });

  it('Account는 있지만 User가 없으면 InternalException을 던진다', async () => {
    const first = await useCase.execute({ githubId: '12345', login: 'octocat' });

    // User만 삭제 (FK CASCADE 우회)
    await userModelRepo.query(`SET session_replication_role = 'replica'`);
    await userModelRepo.query(`DELETE FROM "users" WHERE "id" = $1`, [first.id]);
    await userModelRepo.query(`SET session_replication_role = 'origin'`);

    await expect(useCase.execute({ githubId: '12345', login: 'octocat' })).rejects.toThrow(
      InternalException,
    );
  });
});
