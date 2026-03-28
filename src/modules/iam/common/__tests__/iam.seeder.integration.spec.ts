import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamSeeder } from '../iam.seeder';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { OAuthAccountModel } from '@modules/iam/auth/infrastructure/oauth-account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import { PasswordHasherArgon2 } from '@modules/iam/auth/infrastructure/password-hasher.argon2';
import { LOGGER } from '@libs/log/log.tokens';
import * as argon2 from 'argon2';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin12345';

describe('IamSeeder', () => {
  let iamSeeder: IamSeeder;
  let credentialRepo: Repository<PasswordCredentialModel>;
  let accountRepo: Repository<AccountModel>;
  let userRepo: Repository<UserModel>;
  let module: TestingModule;

  beforeEach(async () => {
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
        IamSeeder,
        { provide: PASSWORD_HASHER, useClass: PasswordHasherArgon2 },
        {
          provide: LOGGER,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    await module.init();

    iamSeeder = module.get<IamSeeder>(IamSeeder);
    credentialRepo = module.get<Repository<PasswordCredentialModel>>(
      getRepositoryToken(PasswordCredentialModel),
    );
    accountRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
    userRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  afterEach(async () => {
    await truncate([credentialRepo, userRepo, accountRepo]);
    await module.close();
  });

  describe('onModuleInit', () => {
    it('모듈 초기화 시 admin 자격증명이 자동으로 생성되어야 한다', async () => {
      const foundCredential = await credentialRepo.findOne({
        where: { email: ADMIN_EMAIL },
      });

      expect(foundCredential).toBeDefined();
      expect(foundCredential!.id).toBeDefined();
      expect(foundCredential!.email).toBe(ADMIN_EMAIL);
      expect(await argon2.verify(foundCredential!.hashedPassword, ADMIN_PASSWORD)).toBe(true);
      expect(foundCredential!.createdAt).toBeInstanceOf(Date);
      expect(foundCredential!.updatedAt).toBeInstanceOf(Date);
    });

    it('모듈 초기화 시 admin 사용자가 자동으로 생성되어야 한다', async () => {
      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBeDefined();
      expect(foundUser!.nickname).toBe('admin');
      expect(foundUser!.email).toBe(ADMIN_EMAIL);
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });

    it('생성된 PasswordCredential의 accountId가 User의 accountId와 일치해야 한다', async () => {
      const foundCredential = await credentialRepo.findOne({
        where: { email: ADMIN_EMAIL },
      });
      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundCredential).toBeDefined();
      expect(foundUser).toBeDefined();
      expect(foundCredential!.accountId).toBe(foundUser!.accountId);
    });
  });

  describe('seedAdminUser (private method via onModuleInit)', () => {
    it('User와 PasswordCredential을 동시에 생성해야 한다', async () => {
      await truncate([credentialRepo, userRepo, accountRepo]);

      await iamSeeder.onModuleInit();

      const credentialCount = await credentialRepo.count();
      const userCount = await userRepo.count();

      expect(credentialCount).toBe(1);
      expect(userCount).toBe(1);
    });

    it('동일한 email로 여러 번 호출 시 중복 생성되지 않아야 한다', async () => {
      await truncate([credentialRepo, userRepo, accountRepo]);

      await iamSeeder.onModuleInit();
      const count1 = await credentialRepo.count();
      expect(count1).toBe(1);

      await iamSeeder.onModuleInit();
      const count2 = await credentialRepo.count();
      expect(count2).toBe(1);
    });

    it('저장된 PasswordCredential의 모든 필드가 올바르게 설정되어야 한다', async () => {
      await truncate([credentialRepo, userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundCredential = await credentialRepo.findOne({
        where: { email: ADMIN_EMAIL },
      });

      expect(foundCredential).toBeDefined();
      expect(foundCredential!.email).toBe(ADMIN_EMAIL);
      expect(await argon2.verify(foundCredential!.hashedPassword, ADMIN_PASSWORD)).toBe(true);
      expect(foundCredential!.id).toBeDefined();
      expect(typeof foundCredential!.id).toBe('string');
      expect(foundCredential!.createdAt).toBeInstanceOf(Date);
      expect(foundCredential!.updatedAt).toBeInstanceOf(Date);
    });

    it('저장된 User의 모든 필드가 올바르게 설정되어야 한다', async () => {
      await truncate([credentialRepo, userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.nickname).toBe('admin');
      expect(foundUser!.email).toBe(ADMIN_EMAIL);
      expect(foundUser!.id).toBeDefined();
      expect(typeof foundUser!.id).toBe('string');
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });

    it('PasswordCredential과 Account 간의 외래 키 관계가 올바르게 설정되어야 한다', async () => {
      await truncate([credentialRepo, userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundCredential = await credentialRepo.findOne({
        where: { email: ADMIN_EMAIL },
        relations: ['account'],
      });

      expect(foundCredential).toBeDefined();
      expect(foundCredential!.account).toBeDefined();
      expect(foundCredential!.accountId).toBe(foundCredential!.account!.id);
    });
  });
});
