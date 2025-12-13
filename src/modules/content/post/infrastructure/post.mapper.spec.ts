import { PostMapper } from './post.mapper';
import { PostModel } from './post.model';
import { Post } from '../domain/post.aggregate';
import { PostId } from '../domain/value-objects/post-id.vo';
import { PostTitle } from '../domain/value-objects/post-title.vo';
import { PostContent } from '../domain/value-objects/post-content.vo';
import { UserId } from '../../../iam/user/domain/value-objects/user-id.vo';

describe('PostMapper', () => {
  let mapper: PostMapper;

  beforeEach(() => {
    mapper = new PostMapper();
  });

  describe('toDomain', () => {
    it('PostModel을 Post 도메인 객체로 변환해야 한다', () => {
      const postModel: PostModel = {
        id: '01912345-6789-7abc-8000-123456789abc',
        title: 'Test Post Title',
        content: 'Test post content',
        authorId: '01912345-6789-7abc-9000-123456789def',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const post = mapper.toDomain(postModel);

      expect(post).toBeInstanceOf(Post);
      expect(post.id).toBeInstanceOf(PostId);
      expect(post.id.value).toBe(postModel.id);
      expect(post.getProps().authorId).toBeInstanceOf(UserId);
      expect(post.getProps().authorId.value).toBe(postModel.authorId);
      expect(post.getProps().title).toBeInstanceOf(PostTitle);
      expect(post.getProps().title.value).toBe(postModel.title);
      expect(post.getProps().content).toBeInstanceOf(PostContent);
      expect(post.getProps().content.value).toBe(postModel.content);
    });

    it('author 관계가 포함된 PostModel도 변환할 수 있어야 한다', () => {
      const postModel: PostModel = {
        id: '01912345-6789-7abc-8111-123456789abc',
        title: 'Test Title',
        content: 'Test content',
        authorId: '01912345-6789-7abc-9111-123456789def',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        author: {
          id: '01912345-6789-7abc-9111-123456789def',
          accountId: '01912345-6789-7abc-a111-123456789ghi',
          nickname: 'test-nickname',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const post = mapper.toDomain(postModel);

      expect(post).toBeInstanceOf(Post);
      expect(post.getProps().authorId.value).toBe('01912345-6789-7abc-9111-123456789def');
    });
  });

  describe('toModel', () => {
    it('Post 도메인 객체를 PostModel로 변환해야 한다', () => {
      const post = Post.from({
        id: PostId.from('01912345-6789-7abc-8222-123456789abc'),
        props: {
          authorId: UserId.from('01912345-6789-7abc-9222-123456789def'),
          title: PostTitle.from('Test Post Title'),
          content: PostContent.from('Test post content'),
        },
      });

      const postModel = mapper.toModel(post);

      expect(postModel).toHaveProperty('id');
      expect(postModel).toHaveProperty('title');
      expect(postModel).toHaveProperty('content');
      expect(postModel).toHaveProperty('authorId');
      expect(postModel).toHaveProperty('createdAt');
      expect(postModel).toHaveProperty('updatedAt');

      expect(postModel.id).toBe('01912345-6789-7abc-8222-123456789abc');
      expect(postModel.title).toBe('Test Post Title');
      expect(postModel.content).toBe('Test post content');
      expect(postModel.authorId).toBe('01912345-6789-7abc-9222-123456789def');
    });
  });

  describe('양방향 변환', () => {
    it('toPersistence 후 toDomain으로 변환하면 동일한 데이터를 가져야 한다', () => {
      const originalPost = Post.create({
        authorId: UserId.from('01912345-6789-7abc-9444-123456789def'),
        title: PostTitle.from('Round Trip Test'),
        content: PostContent.from('Testing round trip conversion'),
      });

      const postModel = mapper.toModel(originalPost);
      const reconstructedPost = mapper.toDomain(postModel);

      expect(reconstructedPost.id.value).toBe(originalPost.id.value);
      expect(reconstructedPost.getProps().authorId.value).toBe(
        originalPost.getProps().authorId.value,
      );
      expect(reconstructedPost.getProps().title.value).toBe(originalPost.getProps().title.value);
      expect(reconstructedPost.getProps().content.value).toBe(
        originalPost.getProps().content.value,
      );
    });
  });
});
