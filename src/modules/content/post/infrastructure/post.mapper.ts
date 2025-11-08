import { PostModel } from './post.model';
import { Post } from '../domain/post.aggregate';
import { UserId } from '../../../iam/user/domain/user/user-id';
import { PostTitle } from '../domain/value-objects/post-title';
import { PostContent } from '../domain/value-objects/post-content';
import { PostId } from '../domain/value-objects/post-id';
import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd/mapper.interface';

@Injectable()
export class PostMapper implements Mapper<Post, PostModel> {
  toDomain(model: PostModel): Post {
    return Post.from({
      id: PostId.from(model.id),
      props: {
        authorId: UserId.from(model.authorId),
        title: PostTitle.from(model.title),
        content: PostContent.from(model.content),
      },
    });
  }

  toModel(post: Post): PostModel {
    const props = post.getProps();
    return PostModel.from({
      id: props.id.value,
      authorId: props.authorId.value,
      title: props.title.value,
      content: props.content.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
