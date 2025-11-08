import { UserId } from '../../../iam/user/domain/value-objects/user-id';
import { PostContent } from './value-objects/post-content';
import { PostTitle } from './value-objects/post-title';
import { PostId } from './value-objects/post-id';
import { AggregateRoot } from '@libs/ddd';

interface CreatePostParams {
  authorId: UserId;
  title: PostTitle;
  content: PostContent;
}

interface PostProps {
  authorId: UserId;
  title: PostTitle;
  content: PostContent;
}

export class Post extends AggregateRoot<PostProps> {
  static create(params: CreatePostParams): Post {
    return new Post({
      id: PostId.generate(),
      props: params,
    });
  }

  static from(data: { id: PostId; props: PostProps }): Post {
    return new Post({
      id: data.id,
      props: data.props,
    });
  }
}
