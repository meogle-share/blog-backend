import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSeeder } from '../infrastructure/user.seeder';
import { UserModel } from '../infrastructure/user.model';
import { getDatabaseConfig } from '@configs/database.config';
import { truncate } from '@test/support/database.helper';

describe('UserSeeder', () => {
  let userSeeder: UserSeeder;
  let userModelRepo: Repository<UserModel>;
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
        TypeOrmModule.forFeature([UserModel]),
      ],
      providers: [UserSeeder],
    }).compile();

    await module.init();

    userSeeder = module.get<UserSeeder>(UserSeeder);
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  afterEach(async () => {
    await truncate([userModelRepo]);
    await module.close();
  });

  describe('onModuleInit', () => {
    it('모듈 초기화 시 admin 사용자가 자동으로 생성되어야 한다', async () => {
      const foundUser = await userModelRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBeDefined();
      expect(foundUser!.username).toBe('admin');
      expect(foundUser!.password).toBe('admin');
      expect(foundUser!.nickname).toBe('admin');
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('seed', () => {
    it('admin 사용자를 DB에 저장해야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거
      await userSeeder.seed();

      const foundUser = await userModelRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.username).toBe('admin');
      expect(foundUser!.password).toBe('admin');
      expect(foundUser!.nickname).toBe('admin');
    });

    it('저장된 사용자는 ID가 자동으로 생성되어야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거
      await userSeeder.seed();

      const foundUser = await userModelRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBeDefined();
      expect(typeof foundUser!.id).toBe('string');
      expect(foundUser!.id.length).toBeGreaterThan(0);
    });

    it('저장된 사용자는 createdAt과 updatedAt이 설정되어야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거
      await userSeeder.seed();

      const foundUser = await userModelRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });

    it('동일한 username으로 여러 번 호출 시 upsert되어야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거

      await userSeeder.seed();
      const count1 = await userModelRepo.count();
      expect(count1).toBe(1);

      await userSeeder.seed();
      const count2 = await userModelRepo.count();
      expect(count2).toBe(1); // upsert되어 개수 유지
    });

    it('DB가 비어있을 때도 정상적으로 저장되어야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거

      const count = await userModelRepo.count();
      expect(count).toBe(0);

      await userSeeder.seed();

      const newCount = await userModelRepo.count();
      expect(newCount).toBe(1);
    });

    it('저장된 사용자의 모든 필드가 올바르게 매핑되어야 한다', async () => {
      await truncate([userModelRepo]); // 기존 admin 제거
      await userSeeder.seed();

      const foundUser = await userModelRepo.findOne({
        where: { username: 'admin' },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser).toMatchObject({
        username: 'admin',
        password: 'admin',
        nickname: 'admin',
      });
      expect(foundUser!.id).toBeDefined();
      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
    });
  });
});
