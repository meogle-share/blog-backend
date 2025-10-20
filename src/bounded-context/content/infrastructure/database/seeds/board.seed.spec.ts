import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardSeedManager } from './board.seed';
import { Board } from '../../../domain/board/board.entity';
import { BOARD_SEEDS } from '../../../domain/board/board.constant';

describe('[Unit] BoardSeeder', () => {
  let boardSeeder: BoardSeedManager;
  let boardRepo: Repository<Board>;

  const mockBoardRepository = {
    exists: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardSeedManager,
        {
          provide: getRepositoryToken(Board),
          useValue: mockBoardRepository,
        },
      ],
    }).compile();

    boardSeeder = module.get<BoardSeedManager>(BoardSeedManager);
    boardRepo = module.get<Repository<Board>>(getRepositoryToken(Board));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seed', () => {
    it('존재하지 않는 게시판 시드 데이터를 insert 해야 한다', async () => {
      mockBoardRepository.exists.mockResolvedValue(false);

      await boardSeeder.seed();

      expect(mockBoardRepository.exists).toHaveBeenCalledTimes(BOARD_SEEDS.length);
      expect(mockBoardRepository.insert).toHaveBeenCalledTimes(BOARD_SEEDS.length);
      expect(mockBoardRepository.insert).toHaveBeenCalledWith(BOARD_SEEDS[0]);
    });

    it('이미 존재하는 게시판 시드 데이터는 insert 하지 않아야 한다', async () => {
      mockBoardRepository.exists.mockResolvedValue(true);

      await boardSeeder.seed();

      expect(mockBoardRepository.exists).toHaveBeenCalledTimes(BOARD_SEEDS.length);
      expect(mockBoardRepository.insert).not.toHaveBeenCalled();
    });
  });
});
