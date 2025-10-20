import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Board } from './board.entity';

export const BOARD_SEEDS: QueryDeepPartialEntity<Board>[] = [
  { name: '기본게시판', slug: 'boards' },
];
