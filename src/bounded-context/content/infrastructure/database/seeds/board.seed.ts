import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from '../../../domain/board/board.entity';
import { Repository } from 'typeorm';
import { BOARD_SEEDS } from '../../../domain/board/board.constant';

@Injectable()
export class BoardSeeder {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
  ) {}

  async seed() {
    await this.boardRepo.upsert(BOARD_SEEDS, {
      conflictPaths: ['name'],
      skipUpdateIfNoValuesChanged: true,
    });
  }
}
