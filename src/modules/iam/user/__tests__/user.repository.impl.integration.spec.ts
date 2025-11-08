import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepositoryImpl } from '../infrastructure/user.repository.impl';
import { UserModel } from '../infrastructure/user.model';
import { UserMapper } from '../infrastructure/user.mapper';
import { User } from '../domain/user.aggregate';
import { UserId } from '../domain/value-objects/user-id';
import { UserName } from '../domain/value-objects/user-name';
import { UserPassword } from '../domain/value-objects/user-password';
import { UserNickName } from '../domain/value-objects/user-nickname';
import { validate } from '@configs/env.validator';
import { getDatabaseConfig } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';

describe('UserRepositoryImpl', () => {
  let userRepository: UserRepositoryImpl;
  let userModelRepo: Repository<UserModel>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ validate }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([UserModel]),
      ],
      providers: [UserRepositoryImpl, UserMapper],
    }).compile();

    userRepository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([userModelRepo]);
  });

  afterAll(async () => {
    await truncate([userModelRepo]);
    await module.close();
  });

  describe('save', () => {
    it('새로운 User를 DB에 저장해야 한다', async () => {
      const user = User.create({
        username: UserName.from('test@example.com'),
        password: UserPassword.from('password123'),
        nickname: UserNickName.from('테스터'),
      });

      const savedUser = await userRepository.save(user);
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.id).toBeDefined();

      const foundModel = await userModelRepo.findOne({
        where: { id: savedUser.id.value },
      });

      expect(foundModel!.username).toBe('test@example.com');
      expect(foundModel!.password).toBe('password123');
      expect(foundModel!.nickname).toBe('테스터');
    });

    it('저장된 User는 createdAt과 updatedAt이 설정되어야 한다', async () => {
      const user = User.create({
        username: UserName.from('user@test.com'),
        password: UserPassword.from('mypassword'),
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
      const user1 = User.create({
        username: UserName.from('user1@test.com'),
        password: UserPassword.from('password1'),
        nickname: UserNickName.from('유저1'),
      });

      const user2 = User.create({
        username: UserName.from('user2@test.com'),
        password: UserPassword.from('password2'),
        nickname: UserNickName.from('유저2'),
      });

      await userRepository.save(user1);
      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(2);
    });

    it('동일한 ID로 저장하면 업데이트되어야 한다', async () => {
      const userId = UserId.generate();
      const user1 = User.from({
        id: userId,
        props: {
          username: UserName.from('original@test.com'),
          password: UserPassword.from('original123'),
          nickname: UserNickName.from('오리지널'),
        },
      });

      await userRepository.save(user1);

      const user2 = User.from({
        id: userId,
        props: {
          username: UserName.from('updated@test.com'),
          password: UserPassword.from('updated456'),
          nickname: UserNickName.from('업데이트'),
        },
      });

      await userRepository.save(user2);

      const count = await userModelRepo.count();
      expect(count).toBe(1);

      const foundModel = await userModelRepo.findOne({
        where: { id: userId.value },
      });
      expect(foundModel!.username).toBe('updated@test.com');
      expect(foundModel!.password).toBe('updated456');
      expect(foundModel!.nickname).toBe('업데이트');
    });
  });
});
