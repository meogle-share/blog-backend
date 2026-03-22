import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OAuthAccountRepository } from '../infrastructure/oauth-account.repository';
import { OAuthAccountModel } from '../infrastructure/oauth-account.model';
import { OAuthAccountMapper } from '../infrastructure/oauth-account.mapper';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { OAuthAccountModelFactory } from '@libs/typeorm/factories/oauth-account.model.factory';

describe('OAuthAccountRepository', () => {
  let repository: OAuthAccountRepository;
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
      providers: [OAuthAccountRepository, OAuthAccountMapper],
    }).compile();

    repository = module.get<OAuthAccountRepository>(OAuthAccountRepository);
    oauthModelRepo = module.get<Repository<OAuthAccountModel>>(
      getRepositoryToken(OAuthAccountModel),
    );
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
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

  describe('findOneByProviderAndId', () => {
    it('존재하는 provider와 providerAccountId로 OAuthAccount를 찾을 수 있어야 한다', async () => {
      const user = UserModelFactory.create(1)[0];
      await userModelRepo.save(user);

      const oauth = OAuthAccountModelFactory.create(1, {
        userId: user.id,
        provider: 'github',
        providerAccountId: '12345',
        providerLogin: 'octocat',
      })[0];
      await oauthModelRepo.save(oauth);

      const found = await repository.findOneByProviderAndId('github', '12345');

      expect(found).toBeInstanceOf(OAuthAccount);
      expect(found!.getProps().provider.value).toBe('github');
      expect(found!.getProps().providerAccountId.value).toBe('12345');
      expect(found!.getProps().providerLogin).toBe('octocat');
    });

    it('존재하지 않는 providerAccountId로는 null을 반환해야 한다', async () => {
      const found = await repository.findOneByProviderAndId('github', 'nonexistent');

      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('새로운 OAuthAccount를 저장해야 한다', async () => {
      const user = UserModelFactory.create(1)[0];
      await userModelRepo.save(user);

      const oauth = OAuthAccountModelFactory.create(1, {
        userId: user.id,
        provider: 'github',
        providerAccountId: '99999',
      })[0];
      await oauthModelRepo.save(oauth);

      const found = await repository.findOneByProviderAndId('github', '99999');
      expect(found).not.toBeNull();
      expect(found!.getProps().userId).toBe(user.id);
    });
  });
});
