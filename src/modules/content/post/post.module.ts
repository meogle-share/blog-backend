import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModel } from './infrastructure/post.model';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from './application/commands/create-post.handler';
import { POST_REPOSITORY } from './domain/post.repository.interface';
import { PostRepositoryImpl } from './infrastructure/post.repository.impl';
import { PostMapper } from './infrastructure/post.mapper';
import { UserModel } from '../../iam/user/infrastructure/user.model';
import { PostHttpController } from './presentation/post.http.controller';
import { GetPostHandler } from './application/queries/get-post.handler';

@Module({
  imports: [TypeOrmModule.forFeature([PostModel, UserModel]), CqrsModule],
  controllers: [PostHttpController],
  providers: [
    {
      provide: POST_REPOSITORY,
      useClass: PostRepositoryImpl,
    },
    CreatePostHandler,
    GetPostHandler,
    PostMapper,
  ],
  exports: [POST_REPOSITORY],
})
export class PostModule {}
