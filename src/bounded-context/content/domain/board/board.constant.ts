import { Board } from './board.entity';
import { DeepPartial } from 'typeorm';

export const BOARD_SEEDS: DeepPartial<Board>[] = [{ name: '기본게시판', slug: 'boards' }];
