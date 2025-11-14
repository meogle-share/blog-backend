import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepositoryImpl } from '../infrastructure/user.repository.impl';
import { UserModel } from '../infrastructure/user.model';
import { UserMapper } from '../infrastructure/user.mapper';
import { User } from '../domain/user.aggregate';
import { UserId } from '../domain/value-objects/user-id';
import { UserNickName } from '../domain/value-objects/user-nickname';
import { getDatabaseConfig } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AccountModelFactory } from '@test/factories/account.model.factory';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;
  let userModelRepo: Repository<UserModel>;
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
          useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([AccountModel, UserModel]),
      ],
      providers: [UserRepositoryImpl, UserMapper],
    }).compile();

    userRepository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
    accountModelRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
  });

  beforeEach(async () => {
    await truncate([userModelRepo, accountModelRepo]);
  });

  afterAll(async () => {
    await truncate([userModelRepo, accountModelRepo]);
    await module.close();
  });

  describe('save', () => {
    it('새로운 User를 DB에 저장해야 한다', async () => {
      const account = AccountModelFactory.create();
      await accountModelRepo.save(account);

      const user = User.create({
        accountId: AccountId.from(account.id),
        nickname: UserNickName.from('테스터'),
      });

      const savedUser = await userRepository.save(user);
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.id).toBeDefined();

      const foundModel = await userModelRepo.findOne({
        where: { id: savedUser.id.value },
      });

      expect(foundModel!.nickname).toBe('테스터');
    });

    it('저장된 User는 createdAt과 updatedAt이 설정되어야 한다', async () => {
      const account = AccountModelFactory.create();
      await accountModelRepo.save(account);

      const user = User.create({
        accountId: AccountId.from(account.id),
        nickname: UserNickName.from('유저'),
      });

      const savedUser = await userRepository.save(user);
      expect(savedUser.getProps().createdAt).toBeInstanceOf(Date);
      expect(savedUser.getProps().updatedAt).toBeInstanceOf(Date);

      const foundModel = await userModelRepo.findOne({
        where: { id: savedUser.id.value },
      });
      expect(foundModel!.createdAt).toBeInstanceOf(Date);
      expect(foundModel!.updatedAt).toBeInstanceOf(Date);
    });

    it('여러 개의 User를 저장할 수 있어야 한다', async () => {
      const account1 = AccountModelFactory.create();
      const account2 = AccountModelFactory.create();
      await accountModelRepo.save(account1);
      await accountModelRepo.save(account2);

      const user1 = User.create({
        accountId: AccountId.from(account1.id),
        nickname: UserNickName.from('유저1'),
      });

      const user2 = User.create({
        accountId: AccountId.from(account2.id),
        nickname: UserNickName.from('유저2'),
      });

      await userRepository.save(user1);
      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(2);
    });

    it('동일한 ID로 저장하면 업데이트되어야 한다', async () => {
      const account = AccountModelFactory.create();
      await accountModelRepo.save(account);

      const userId = UserId.generate();
      const user1 = User.from({
        id: userId,
        props: {
          accountId: AccountId.from(account.id),
          nickname: UserNickName.from('오리지널'),
        },
      });

      await userRepository.save(user1);

      const user2 = User.from({
        id: userId,
        props: {
          accountId: AccountId.from(account.id),
          nickname: UserNickName.from('업데이트'),
        },
      });

      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(1);

      const foundModel = await userModelRepo.findOne({
        where: { id: userId.value },
      });
      expect(foundModel!.nickname).toBe('업데이트');
    });
  });
});
