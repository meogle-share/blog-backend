import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostHandler } from './create-post.handler';
import { CreatePostCommand } from './create-post.command';
import { IPostRepository, POST_REPOSITORY } from '../../domain/post.repository.interface';
import { Post } from '../../domain/post.aggregate';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;
  let postRepository: jest.Mocked<IPostRepository>;
  let testAuthorId: string;

  const mockPostRepository = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostHandler,
        {
          provide: POST_REPOSITORY,
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
    postRepository = module.get(POST_REPOSITORY);
    testAuthorId = UserId.generate().value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('유효한 CreatePostCommand로 Post를 생성하고 저장해야 한다', async () => {
      const command = new CreatePostCommand(testAuthorId, 'Test Post Title', 'Test post content');
      await handler.execute(command);

      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledWith(expect.any(Post));
    });

    it('생성된 Post는 command의 데이터를 포함해야 한다', async () => {
      const authorId = UserId.generate().value;
      const command = new CreatePostCommand(authorId, 'Another Title', 'Another content');

      await handler.execute(command);

      const savedPost = postRepository.save.mock.calls[0][0];
      expect(savedPost.getProps().authorId.value).toBe(command.authorId);
      expect(savedPost.getProps().title.value).toBe(command.title);
      expect(savedPost.getProps().content.value).toBe(command.content);
    });

    it('생성된 Post는 자동으로 ID가 생성되어야 한다', async () => {
      const authorId = UserId.generate().value;
      const command = new CreatePostCommand(authorId, 'Title with ID', 'Content with ID');

      await handler.execute(command);

      const savedPost = postRepository.save.mock.calls[0][0];
      expect(savedPost.id).toBeDefined();
      expect(savedPost.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('제목이 빈 문자열이면 오류를 발생시켜야 한다', async () => {
      const command = new CreatePostCommand(testAuthorId, '', 'Valid content');

      await expect(handler.execute(command)).rejects.toThrow();
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it('내용이 빈 문자열이면 오류를 발생시켜야 한다', async () => {
      const command = new CreatePostCommand(testAuthorId, 'Valid title', '');

      await expect(handler.execute(command)).rejects.toThrow();
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it('제목이 최대 길이를 초과하면 오류를 발생시켜야 한다', async () => {
      const tooLongTitle = 'A'.repeat(301);
      const command = new CreatePostCommand(testAuthorId, tooLongTitle, 'Valid content');

      await expect(handler.execute(command)).rejects.toThrow();
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it('내용이 최대 길이를 초과하면 오류를 발생시켜야 한다', async () => {
      const tooLongContent = 'A'.repeat(100001);
      const command = new CreatePostCommand(testAuthorId, 'Valid title', tooLongContent);

      await expect(handler.execute(command)).rejects.toThrow();
      expect(postRepository.save).not.toHaveBeenCalled();
    });

    it('여러 개의 Post를 순차적으로 생성할 수 있어야 한다', async () => {
      const authorId1 = UserId.generate().value;
      const authorId2 = UserId.generate().value;
      const command1 = new CreatePostCommand(authorId1, 'Title 1', 'Content 1');
      const command2 = new CreatePostCommand(authorId2, 'Title 2', 'Content 2');

      await handler.execute(command1);
      await handler.execute(command2);

      expect(postRepository.save).toHaveBeenCalledTimes(2);

      const savedPost1 = postRepository.save.mock.calls[0][0];
      const savedPost2 = postRepository.save.mock.calls[1][0];

      expect(savedPost1.id.value).not.toBe(savedPost2.id.value);
    });

    it('repository.save가 실패하면 오류를 전파해야 한다', async () => {
      const command = new CreatePostCommand(testAuthorId, 'Test Title', 'Test content');
      const error = new Error('Database error');
      postRepository.save.mockRejectedValue(error);

      await expect(handler.execute(command)).rejects.toThrow('Database error');
    });
  });
});
