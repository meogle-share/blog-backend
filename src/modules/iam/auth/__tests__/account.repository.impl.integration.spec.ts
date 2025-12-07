import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountRepositoryImpl } from '../infrastructure/account.repository.impl';
import { AccountModel } from '../infrastructure/account.model';
import { AccountMapper } from '../infrastructure/account.mapper';
import { Account } from '../domain/account.aggregate';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { AccountModelFactory } from '@libs/typeorm/factories/account.model.factory';

describe('AccountRepositoryImpl', () => {
  let accountRepository: AccountRepositoryImpl;
  let accountModelRepo: Repository<AccountModel>;
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
        TypeOrmModule.forFeature([AccountModel]),
      ],
      providers: [AccountRepositoryImpl, AccountMapper],
    }).compile();

    accountRepository = module.get<AccountRepositoryImpl>(AccountRepositoryImpl);
    accountModelRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
  });

  beforeEach(async () => {
    await truncate([accountModelRepo]);
  });

  afterAll(async () => {
    await truncate([accountModelRepo]);
    await module.close();
  });

  describe('findByUsername', () => {
    it('존재하는 username으로 Account를 찾을 수 있어야 한다', async () => {
      const account = AccountModelFactory.create(1, {
        username: 'test@example.com',
        password: 'hashedPassword123',
      })[0];
      await accountModelRepo.save(account);

      const found = await accountRepository.findOneByUsername('test@example.com');

      expect(found).toBeInstanceOf(Account);
      expect(found!.getProps().username.value).toBe('test@example.com');
      expect(found!.getProps().password.value).toBe('hashedPassword123');
    });

    it('존재하지 않는 username으로는 null을 반환해야 한다', async () => {
      const found = await accountRepository.findOneByUsername('nonexistent@example.com');

      expect(found).toBeNull();
    });

    it('여러 Account가 있을 때 정확한 username으로 조회해야 한다', async () => {
      const accounts = [
        AccountModelFactory.create(1, {
          username: 'user1@example.com',
          password: 'password1',
        })[0],
        AccountModelFactory.create(1, {
          username: 'user2@example.com',
          password: 'password2',
        })[0],
        AccountModelFactory.create(1, {
          username: 'user3@example.com',
          password: 'password3',
        })[0],
      ];
      await accountModelRepo.save(accounts);

      const found = await accountRepository.findOneByUsername('user2@example.com');

      expect(found).not.toBeNull();
      expect(found!.getProps().username.value).toBe('user2@example.com');
      expect(found!.getProps().password.value).toBe('password2');
    });

    it('Mapper를 통해 Domain 객체로 올바르게 변환되어야 한다', async () => {
      const account = AccountModelFactory.create(1, {
        username: 'mapper@example.com',
        password: 'securePassword456',
      })[0];
      await accountModelRepo.save(account);

      const found = await accountRepository.findOneByUsername('mapper@example.com');

      expect(found).toBeInstanceOf(Account);
      expect(found!.id.value).toBe(account.id);
      expect(found!.getProps().username.value).toBe(account.username);
      expect(found!.getProps().password.value).toBe(account.password);
    });
  });
});
