import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { PostTitle } from '../../domain/value-objects/post-title';
import { PostContent } from '../../domain/value-objects/post-content';
import { Post } from '../../domain/post.aggregate';
import type { IPostRepository } from '../../domain/post.repository.interface';
import { POST_REPOSITORY } from '../../domain/post.repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const post = Post.create({
      authorId: UserId.from(command.authorId),
      title: PostTitle.from(command.title),
      content: PostContent.from(command.content),
    });

    return await this.postRepository.save(post);
  }
}
