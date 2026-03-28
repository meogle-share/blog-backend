import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitHubSignInUseCase } from '../application/github-sign-in.usecase';
import { OAuthAccountRepository } from '../infrastructure/oauth-account.repository';
import { OAuthAccountMapper } from '../infrastructure/oauth-account.mapper';
import { OAuthAccountModel } from '../infrastructure/oauth-account.model';
import { UserRepository } from '@modules/iam/user/infrastructure/user.repository';
import { UserMapper } from '@modules/iam/user/infrastructure/user.mapper';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { OAUTH_ACCOUNT_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { OAuthAccountModelFactory } from '@libs/typeorm/factories/oauth-account.model.factory';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { Provider } from '../domain/models/account-provider.vo';
import { InternalException } from '@libs/exceptions';

describe('GitHubSignInUseCase', () => {
  let useCase: GitHubSignInUseCase;
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
        TypeOrmModule.forFeature([OAuthAccountModel, UserModel]),
      ],
      providers: [
        {
          provide: OAUTH_ACCOUNT_REPOSITORY,
          useClass: OAuthAccountRepository,
        },
        {
          provide: USER_REPOSITORY,
          useClass: UserRepository,
        },
        OAuthAccountMapper,
        UserMapper,
        GitHubSignInUseCase,
      ],
    }).compile();

    useCase = module.get(GitHubSignInUseCase);
    oauthModelRepo = module.get(getRepositoryToken(OAuthAccountModel));
    userModelRepo = module.get(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([oauthModelRepo, userModelRepo]);
    UserModelFactory.reset();
    OAuthAccountModelFactory.reset();
  });

  afterAll(async () => {
    await truncate([oauthModelRepo, userModelRepo]);
    await module.close();
  });

  it('신규 GitHub 사용자이면 유저와 OAuth 계정을 생성한다', async () => {
    const result = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(result).toBeInstanceOf(User);
    expect(result.getProps().nickname.value).toBe('octocat');
    expect(result.getProps().email).toBeNull();

    const savedUser = await userModelRepo.findOneBy({ id: result.id });
    expect(savedUser).toBeDefined();
    expect(savedUser!.nickname).toBe('octocat');

    const savedOAuth = await oauthModelRepo.findOneBy({ userId: result.id });
    expect(savedOAuth).toBeDefined();
    expect(savedOAuth!.provider).toBe(Provider.GITHUB);
    expect(savedOAuth!.providerAccountId).toBe('12345');
    expect(savedOAuth!.providerLogin).toBe('octocat');
  });

  it('GitHub login의 하이픈을 제거하여 닉네임을 생성한다', async () => {
    const result = await useCase.execute({ githubId: '99999', login: 'my-cool-name' });

    expect(result.getProps().nickname.value).toBe('mycoolname');

    const savedUser = await userModelRepo.findOneBy({ id: result.id });
    expect(savedUser!.nickname).toBe('mycoolname');
  });

  it('기존 GitHub 계정이 있으면 해당 유저를 반환한다', async () => {
    const [userModel] = UserModelFactory.create(1);
    await userModelRepo.save(userModel);

    const [oauthModel] = OAuthAccountModelFactory.create(1, {
      userId: userModel.id,
      provider: Provider.GITHUB,
      providerAccountId: '12345',
      providerLogin: 'octocat',
    });
    await oauthModelRepo.save(oauthModel);

    const result = await useCase.execute({ githubId: '12345', login: 'octocat' });

    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe(userModel.id);

    const userCount = await userModelRepo.count();
    expect(userCount).toBe(1);

    const oauthCount = await oauthModelRepo.count();
    expect(oauthCount).toBe(1);
  });

  it('OAuth 계정은 있지만 유저가 없으면 InternalException을 던진다', async () => {
    const [userModel] = UserModelFactory.create(1);
    await userModelRepo.save(userModel);

    const [oauthModel] = OAuthAccountModelFactory.create(1, {
      userId: userModel.id,
      provider: Provider.GITHUB,
      providerAccountId: '12345',
      providerLogin: 'octocat',
    });
    await oauthModelRepo.save(oauthModel);

    // OAuth 계정은 남겨두고 유저만 삭제 (FK CASCADE 우회)
    await userModelRepo.query(`SET session_replication_role = 'replica'`);
    await userModelRepo.query(`DELETE FROM "users" WHERE "id" = $1`, [userModel.id]);
    await userModelRepo.query(`SET session_replication_role = 'origin'`);

    await expect(useCase.execute({ githubId: '12345', login: 'octocat' })).rejects.toThrow(
      InternalException,
    );
  });
});
