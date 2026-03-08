import { PostModel } from './post.model';
import { Post } from '../domain/post.aggregate';
import { PostTitle } from '../domain/value-objects/post-title.vo';
import { PostContent } from '../domain/value-objects/post-content.vo';
import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd/mapper.interface';

@Injectable()
export class PostMapper implements Mapper<Post, PostModel> {
  toDomain(model: PostModel): Post {
    return Post.from({
      id: model.id,
      props: {
        authorId: model.authorId,
        title: PostTitle.from(model.title),
        content: PostContent.from(model.content),
      },
    });
  }

  toModel(post: Post): PostModel {
    const props = post.getProps();
    return PostModel.from({
      id: props.id,
      authorId: props.authorId,
      title: props.title.value,
      content: props.content.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
