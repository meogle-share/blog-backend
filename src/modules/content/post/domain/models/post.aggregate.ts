import { PostContent } from './post-content.vo';
import { PostTitle } from './post-title.vo';
import { AggregateRoot, generateId } from '@libs/ddd';

interface CreatePostParams {
  authorId: string;
  title: PostTitle;
  content: PostContent;
}

interface PostProps {
  authorId: string;
  title: PostTitle;
  content: PostContent;
}

export class Post extends AggregateRoot<PostProps> {
  static create(params: CreatePostParams): Post {
    return new Post({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: PostProps }): Post {
    return new Post({
      id: data.id,
      props: data.props,
    });
  }
}
