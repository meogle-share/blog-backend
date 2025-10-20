import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './domain/board/board.entity';
import { Comment } from './domain/comment/comment.entity';
import { Post } from './domain/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, Comment, Post])],
})
export class ContentModule {}
