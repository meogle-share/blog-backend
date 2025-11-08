import { Post } from './post.aggregate';
import { PostId } from './value-objects/post-id';
import { PostTitle } from './value-objects/post-title';
import { PostContent } from './value-objects/post-content';
import { UserId } from '../../../iam/user/domain/user/user-id';

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

    it('생성시 자동으로 UUID 형식의 ID가 할당되어야 한다', () => {
      const post = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Test Title'),
        content: PostContent.from('Test content'),
      });

      expect(post.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('생성시 createdAt과 updatedAt이 설정되어야 한다', () => {
      const post = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Test Title'),
        content: PostContent.from('Test content'),
      });

      expect(post.getProps().createdAt).toBeInstanceOf(Date);
      expect(post.getProps().updatedAt).toBeInstanceOf(Date);
    });

    it('매번 다른 ID를 가진 Post가 생성되어야 한다', () => {
      const post1 = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Title 1'),
        content: PostContent.from('Content 1'),
      });

      const post2 = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Title 2'),
        content: PostContent.from('Content 2'),
      });

      expect(post1.id.value).not.toBe(post2.id.value);
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

    it('특정 ID로 Post를 재구성할 수 있어야 한다', () => {
      const specificId = PostId.from('01912345-6789-7abc-8666-123456789abc');

      const post = Post.from({
        id: specificId,
        props: {
          authorId: UserId.generate(),
          title: PostTitle.from('Title'),
          content: PostContent.from('Content'),
        },
      });

      expect(post.id).toBe(specificId);
      expect(post.id.value).toBe('01912345-6789-7abc-8666-123456789abc');
    });
  });

  describe('getProps', () => {
    it('Post의 모든 속성을 반환해야 한다', () => {
      const authorId = UserId.generate();
      const title = PostTitle.from('Title');
      const content = PostContent.from('Content');

      const post = Post.create({
        authorId,
        title,
        content,
      });

      const props = post.getProps();

      expect(props).toHaveProperty('id');
      expect(props).toHaveProperty('authorId');
      expect(props).toHaveProperty('title');
      expect(props).toHaveProperty('content');
      expect(props).toHaveProperty('createdAt');
      expect(props).toHaveProperty('updatedAt');
    });
  });

  describe('ID 비교', () => {
    it('동일한 ID를 가진 Post는 같은 엔티티로 간주되어야 한다', () => {
      const postId = PostId.from('01912345-6789-7abc-8777-123456789abc');
      const post1 = Post.from({
        id: postId,
        props: {
          authorId: UserId.generate(),
          title: PostTitle.from('Title 1'),
          content: PostContent.from('Content 1'),
        },
      });

      const post2 = Post.from({
        id: postId,
        props: {
          authorId: UserId.generate(),
          title: PostTitle.from('Title 2'),
          content: PostContent.from('Content 2'),
        },
      });

      expect(post1.id.equals(post2.id)).toBe(true);
    });

    it('다른 ID를 가진 Post는 다른 엔티티로 간주되어야 한다', () => {
      const post1 = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Title'),
        content: PostContent.from('Content'),
      });

      const post2 = Post.create({
        authorId: UserId.generate(),
        title: PostTitle.from('Title'),
        content: PostContent.from('Content'),
      });

      expect(post1.id.equals(post2.id)).toBe(false);
    });
  });
});
