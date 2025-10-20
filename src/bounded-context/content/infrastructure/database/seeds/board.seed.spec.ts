import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardSeeder } from './board.seed';
import { Board } from '../../../domain/board/board.entity';
import { BOARD_SEEDS } from '../../../domain/board/board.constant';

describe('BoardSeeder', () => {
  let boardSeeder: BoardSeeder;
  let boardRepo: Repository<Board>;

  const mockBoardRepository = {
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardSeeder,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
      ],
    }).compile();

    boardSeeder = module.get<BoardSeeder>(BoardSeeder);
    boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seed', () => {
    it('게시판 시드 데이터를 생성하는 upsert 메서드가 한번 호출되어야 한다', async () => {
      await boardSeeder.seed();

      expect(mockBoardRepository.upsert).toHaveBeenCalledTimes(1);
      expect(mockBoardRepository.upsert).toHaveBeenCalledWith(BOARD_SEEDS, {
        conflictPaths: ['name'],
        skipUpdateIfNoValuesChanged: true,
      });
    });
  });
});
