import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordCredentialRepository } from '../infrastructure/password-credential.repository';
import { PasswordCredentialModel } from '../infrastructure/password-credential.model';
import { PasswordCredentialMapper } from '../infrastructure/password-credential.mapper';
import { PasswordCredential } from '../domain/models/password-credential.entity';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { PasswordCredentialModelFactory } from '@libs/typeorm/factories/password-credential.model.factory';

describe('PasswordCredentialRepository', () => {
  let repository: PasswordCredentialRepository;
  let credentialModelRepo: Repository<PasswordCredentialModel>;
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
        TypeOrmModule.forFeature([PasswordCredentialModel, UserModel]),
      ],
      providers: [PasswordCredentialRepository, PasswordCredentialMapper],
    }).compile();

    repository = module.get<PasswordCredentialRepository>(PasswordCredentialRepository);
    credentialModelRepo = module.get<Repository<PasswordCredentialModel>>(
      getRepositoryToken(PasswordCredentialModel),
    );
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([credentialModelRepo, userModelRepo]);
    UserModelFactory.reset();
    PasswordCredentialModelFactory.reset();
  });

  afterAll(async () => {
    await truncate([credentialModelRepo, userModelRepo]);
    await module.close();
  });

  describe('findOneByEmail', () => {
    it('존재하는 email로 PasswordCredential을 찾을 수 있어야 한다', async () => {
      const user = UserModelFactory.create(1)[0];
      await userModelRepo.save(user);

      const credential = PasswordCredentialModelFactory.create(1, {
        userId: user.id,
        email: 'test@example.com',
        hashedPassword: 'hashedPassword123',
      })[0];
      await credentialModelRepo.save(credential);

      const found = await repository.findOneByEmail('test@example.com');

      expect(found).toBeInstanceOf(PasswordCredential);
      expect(found!.getProps().email.value).toBe('test@example.com');
      expect(found!.getProps().hashedPassword.value).toBe('hashedPassword123');
    });

    it('존재하지 않는 email로는 null을 반환해야 한다', async () => {
      const found = await repository.findOneByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('새로운 PasswordCredential을 저장해야 한다', async () => {
      const user = UserModelFactory.create(1)[0];
      await userModelRepo.save(user);

      const credential = PasswordCredentialModelFactory.create(1, {
        userId: user.id,
        email: 'save-test@example.com',
      })[0];
      await credentialModelRepo.save(credential);

      const found = await repository.findOneByEmail('save-test@example.com');
      expect(found).not.toBeNull();
      expect(found!.getProps().userId).toBe(user.id);
    });
  });
});
