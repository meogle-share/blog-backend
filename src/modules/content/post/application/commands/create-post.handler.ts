import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';
import { PostTitle } from '../../domain/models/post-title.vo';
import { PostContent } from '../../domain/models/post-content.vo';
import { Post } from '../../domain/models/post.aggregate';
import type { PostRepositoryPort } from '../../domain/ports/post.repository.port';
import { POST_REPOSITORY } from '../../post.tokens';
import { Inject } from '@nestjs/common';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepositoryPort,
  ) {}

  async execute(command: CreatePostCommand) {
    const post = Post.create({
      authorId: command.authorId,
      title: PostTitle.from(command.title),
      content: PostContent.from(command.content),
    });

    return await this.postRepository.save(post);
  }
}
