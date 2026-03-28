import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from '../infrastructure/user.repository';
import { UserModel } from '../infrastructure/user.model';
import { UserMapper } from '../infrastructure/user.mapper';
import { User } from '../domain/models/user.aggregate';
import { UserNickName } from '../domain/models/user-nickname.vo';
import { UserEmail } from '../domain/models/user-email.vo';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { generateId } from '@libs/ddd';

describe('UserRepository', () => {
  let userRepository: UserRepository;
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
        TypeOrmModule.forFeature([UserModel]),
      ],
      providers: [UserRepository, UserMapper],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([userModelRepo]);
    UserModelFactory.reset();
  });

  afterAll(async () => {
    await truncate([userModelRepo]);
    await module.close();
  });

  describe('findOneById', () => {
    it('존재하는 ID로 User를 찾을 수 있어야 한다', async () => {
      const userModel = UserModelFactory.create(1)[0];
      await userModelRepo.save(userModel);

      const found = await userRepository.findOneById(userModel.id);

      expect(found).toBeInstanceOf(User);
      expect(found!.id).toBe(userModel.id);
      expect(found!.getProps().nickname.value).toBe(userModel.nickname);
    });

    it('존재하지 않는 ID로는 null을 반환해야 한다', async () => {
      const found = await userRepository.findOneById(generateId());

      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('새로운 User를 DB에 저장해야 한다', async () => {
      const user = User.create({
        accountId: generateId(),
        nickname: UserNickName.from('테스터'),
        email: UserEmail.from('test@example.com'),
      });

      const savedUser = await userRepository.save(user);
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.id).toBeDefined();

      const foundModel = await userModelRepo.findOne({
        where: { id: savedUser.id },
      });

      expect(foundModel!.nickname).toBe('테스터');
      expect(foundModel!.email).toBe('test@example.com');
    });

    it('저장된 User는 createdAt과 updatedAt이 설정되어야 한다', async () => {
      const user = User.create({
        accountId: generateId(),
        nickname: UserNickName.from('유저'),
        email: null,
      });

      const savedUser = await userRepository.save(user);
      expect(savedUser.getProps().createdAt).toBeInstanceOf(Date);
      expect(savedUser.getProps().updatedAt).toBeInstanceOf(Date);
    });

    it('여러 개의 User를 저장할 수 있어야 한다', async () => {
      const user1 = User.create({
        accountId: generateId(),
        nickname: UserNickName.from('유저1'),
        email: UserEmail.from('user1@example.com'),
      });

      const user2 = User.create({
        accountId: generateId(),
        nickname: UserNickName.from('유저2'),
        email: UserEmail.from('user2@example.com'),
      });

      await userRepository.save(user1);
      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(2);
    });

    it('동일한 ID로 저장하면 업데이트되어야 한다', async () => {
      const userId = generateId();
      const accountId = generateId();
      const user1 = User.from({
        id: userId,
        props: {
          accountId,
          nickname: UserNickName.from('오리지널'),
          email: UserEmail.from('original@example.com'),
        },
      });

      await userRepository.save(user1);

      const user2 = User.from({
        id: userId,
        props: {
          accountId,
          nickname: UserNickName.from('업데이트'),
          email: UserEmail.from('original@example.com'),
        },
      });

      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(1);

      const foundModel = await userModelRepo.findOne({
        where: { id: userId },
      });
      expect(foundModel!.nickname).toBe('업데이트');
    });
  });
});
