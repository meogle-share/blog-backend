import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostHandler } from './create-post.handler';
import { CreatePostCommand } from './create-post.command';
import { IPostRepository, POST_REPOSITORY } from '../../domain/post.repository.interface';
import { Post } from '../../domain/post.aggregate';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id.vo';

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
  });
});
