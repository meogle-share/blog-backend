import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardSeedManager } from './board.seed';
import { Board } from '../../../domain/board/board.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '../../../../../infrastructure/environment/validator';
import { getTestDatabaseConfig } from '../../../../../infrastructure/persistence/typeorm/config/postgres.config';

describe('[Integration] BoardSeeder', () => {
  let boardSeeder: BoardSeedManager;
  let boardRepo: Repository<Board>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate,
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => getTestDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([Board]),
      ],
      providers: [BoardSeedManager],
    }).compile();

    boardSeeder = module.get<BoardSeedManager>(BoardSeedManager);
    boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  beforeEach(async () => {
    await boardRepo.clear();
  });

  afterAll(async () => {
    await boardRepo.clear();
    await module.close();
  });

  describe('seed', () => {
    it('실제 DB에 게시판 시드 데이터가 생성되어야 한다', async () => {
      // Given
      const beforeCount = await boardRepo.count();
      expect(beforeCount).toBe(0);

      // When
      await boardSeeder.seed();

      // Then
      await boardRepo.find().then((res) => {
        expect(res).toHaveLength(1);
        expect(res[0].name).toBe('기본게시판');
        expect(res[0].slug).toBe('boards');
      });
    });

    it('중복된 이름으로 시드를 실행하면 upsert로 동작해야 한다', async () => {
      // Given
      await boardSeeder.seed();
      const firstRun = await boardRepo.find();
      expect(firstRun).toHaveLength(1);
      const firstId = firstRun[0].id;

      // When - 두 번째 실행
      await boardSeeder.seed();

      // Then
      const secondRun = await boardRepo.find();
      expect(secondRun).toHaveLength(1);
      expect(secondRun[0].id).toBe(firstId);
      expect(secondRun[0].name).toBe('기본게시판');
      expect(secondRun[0].slug).toBe('boards');
    });

    it('수동으로 생성한 데이터와 시드 데이터가 공존할 수 있어야 한다', async () => {
      // Given - 수동으로 데이터 생성
      const manualBoard = boardRepo.create({
        name: '커스텀게시판',
        slug: 'custom',
      });
      await boardRepo.save(manualBoard);

      // When
      await boardSeeder.seed();

      // Then
      await boardRepo.find({ order: { id: 'ASC' } }).then((boards) => {
        expect(boards).toHaveLength(2);
        expect(boards[0].name).toBe('커스텀게시판');
        expect(boards[1].name).toBe('기본게시판');
      });
    });
  });
});
