import { Post } from '../models/post.aggregate';

export interface PostRepositoryPort {
  save(post: Post): Promise<Post>;
}
