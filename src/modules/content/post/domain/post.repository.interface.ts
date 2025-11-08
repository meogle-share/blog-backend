import { Post } from './post.aggregate';

export const POST_REPOSITORY = Symbol('IPostRepository');
export interface IPostRepository {
  save(post: Post): Promise<Post>;
}
