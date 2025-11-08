import { Command } from '@nestjs/cqrs';
import { Post } from '@modules/content/post/domain/post.aggregate';

export class CreatePostCommand extends Command<Post> {
  constructor(
    public readonly authorId: string,
    public readonly title: string,
    public readonly content: string,
  ) {
    super();
  }
}
