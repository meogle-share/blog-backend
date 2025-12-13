import { UserId } from '../../../iam/user/domain/value-objects/user-id.vo';
import { PostContent } from './value-objects/post-content.vo';
import { PostTitle } from './value-objects/post-title.vo';
import { PostId } from './value-objects/post-id.vo';
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
