import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../../../domain/board/board.entity';
import { Repository } from 'typeorm';
import { BOARD_SEEDS } from '../../../domain/board/board.constant';

@Injectable()
export class BoardSeedManager {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
  ) {}

  async seed() {
    for (const seed of BOARD_SEEDS) {
      const exists = await this.boardRepo.exists({ where: { slug: seed.slug } });
      if (!exists) {
        await this.boardRepo.insert(seed);
      }
    }
  }
}
