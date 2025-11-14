import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamSeeder } from '../iam.seeder';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { getDatabaseConfig } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';

describe('IamSeeder', () => {
  let iamSeeder: IamSeeder;
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
          useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([AccountModel, UserModel]),
      ],
      providers: [IamSeeder],
    }).compile();

    await module.init();

    iamSeeder = module.get<IamSeeder>(IamSeeder);
    accountRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
    userRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  afterEach(async () => {
    await truncate([userRepo, accountRepo]);
    await module.close();
  });

  describe('onModuleInit', () => {
    it('모듈 초기화 시 admin 계정이 자동으로 생성되어야 한다', async () => {
      const foundAccount = await accountRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundAccount).toBeDefined();
      expect(foundAccount!.id).toBeDefined();
      expect(foundAccount!.username).toBe('admin');
      expect(foundAccount!.password).toBe('admin');
      expect(foundAccount!.createdAt).toBeInstanceOf(Date);
      expect(foundAccount!.updatedAt).toBeInstanceOf(Date);
    });

    it('모듈 초기화 시 admin 사용자가 자동으로 생성되어야 한다', async () => {
      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBeDefined();
      expect(foundUser!.nickname).toBe('admin');
      expect(foundUser!.accountId).toBeDefined();
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });

    it('생성된 User의 accountId가 Account의 id와 일치해야 한다', async () => {
      const foundAccount = await accountRepo.findOne({
        where: { username: 'admin' },
      });
      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundAccount).toBeDefined();
      expect(foundUser).toBeDefined();
      expect(foundUser!.accountId).toBe(foundAccount!.id);
    });
  });

  describe('seedAdminUser (private method via onModuleInit)', () => {
    it('Account와 User를 동시에 생성해야 한다', async () => {
      await truncate([userRepo, accountRepo]);

      // onModuleInit을 통해 seedAdminUser 호출
      await iamSeeder.onModuleInit();

      const accountCount = await accountRepo.count();
      const userCount = await userRepo.count();

      expect(accountCount).toBe(1);
      expect(userCount).toBe(1);
    });

    it('동일한 username으로 여러 번 호출 시 Account가 upsert되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);

      await iamSeeder.onModuleInit();
      const count1 = await accountRepo.count();
      expect(count1).toBe(1);

      await iamSeeder.onModuleInit();
      const count2 = await accountRepo.count();
      expect(count2).toBe(1);
    });

    it('동일한 nickname으로 여러 번 호출 시 User가 upsert되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);

      await iamSeeder.onModuleInit();
      const count1 = await userRepo.count();
      expect(count1).toBe(1);

      await iamSeeder.onModuleInit();
      const count2 = await userRepo.count();
      expect(count2).toBe(1);
    });

    it('DB가 비어있을 때도 정상적으로 저장되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);

      const accountCount = await accountRepo.count();
      const userCount = await userRepo.count();
      expect(accountCount).toBe(0);
      expect(userCount).toBe(0);

      await iamSeeder.onModuleInit();

      const newAccountCount = await accountRepo.count();
      const newUserCount = await userRepo.count();
      expect(newAccountCount).toBe(1);
      expect(newUserCount).toBe(1);
    });

    it('저장된 Account의 모든 필드가 올바르게 설정되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundAccount = await accountRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundAccount).toBeDefined();
      expect(foundAccount!.username).toBe('admin');
      expect(foundAccount!.password).toBe('admin');
      expect(foundAccount!.id).toBeDefined();
      expect(typeof foundAccount!.id).toBe('string');
      expect(foundAccount!.id.length).toBeGreaterThan(0);
      expect(foundAccount!.createdAt).toBeInstanceOf(Date);
      expect(foundAccount!.updatedAt).toBeInstanceOf(Date);
    });

    it('저장된 User의 모든 필드가 올바르게 설정되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.nickname).toBe('admin');
      expect(foundUser!.accountId).toBeDefined();
      expect(typeof foundUser!.accountId).toBe('string');
      expect(foundUser!.id).toBeDefined();
      expect(typeof foundUser!.id).toBe('string');
      expect(foundUser!.id.length).toBeGreaterThan(0);
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });

    it('User와 Account 간의 외래 키 관계가 올바르게 설정되어야 한다', async () => {
      await truncate([userRepo, accountRepo]);
      await iamSeeder.onModuleInit();

      const foundUser = await userRepo.findOne({
        where: { nickname: 'admin' },
        relations: ['account'],
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.account).toBeDefined();
      expect(foundUser!.account!.username).toBe('admin');
      expect(foundUser!.account!.id).toBe(foundUser!.accountId);
    });
  });
});