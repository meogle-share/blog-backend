import { Post } from './post.aggregate';
import { PostId } from './value-objects/post-id.vo';
import { PostTitle } from './value-objects/post-title.vo';
import { PostContent } from './value-objects/post-content.vo';
import { UserId } from '../../../iam/user/domain/value-objects/user-id.vo';

describe('Post Aggregate', () => {
  describe('create', () => {
    it('유효한 파라미터로 Post를 생성해야 한다', () => {
      const authorId = UserId.generate();
      const title = PostTitle.from('Test Post Title');
      const content = PostContent.from('Test post content');

      const post = Post.create({
        authorId,
        title,
        content,
      });

      expect(post).toBeInstanceOf(Post);
      expect(post.id).toBeInstanceOf(PostId);
      expect(post.getProps().authorId).toBe(authorId);
      expect(post.getProps().title).toBe(title);
      expect(post.getProps().content).toBe(content);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 Post를 재구성해야 한다', () => {
      const postId = PostId.from('01912345-6789-7abc-8555-123456789abc');
      const authorId = UserId.from('01912345-6789-7abc-9555-123456789def');
      const title = PostTitle.from('Existing Title');
      const content = PostContent.from('Existing content');

      const post = Post.from({
        id: postId,
        props: {
          authorId,
          title,
          content,
        },
      });

      expect(post).toBeInstanceOf(Post);
      expect(post.id).toBe(postId);
      expect(post.getProps().authorId).toBe(authorId);
      expect(post.getProps().title).toBe(title);
      expect(post.getProps().content).toBe(content);
    });
  });
});
