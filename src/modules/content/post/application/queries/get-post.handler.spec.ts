import { Test, TestingModule } from '@nestjs/testing';
import { GetPostHandler } from './get-post.handler';
import { GetPostQuery } from './get-post.query';
import { PostModel } from '../../infrastructure/post.model';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { PostResponseDto } from '../../presentation/dto/post.response.dto';

describe('GetPostHandler', () => {
  let handler: GetPostHandler;
  let repository: jest.Mocked<Repository<PostModel>>;

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostHandler,
        {
          provide: getRepositoryToken(PostModel),
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<GetPostHandler>(GetPostHandler);
    repository = module.get(getRepositoryToken(PostModel));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('게시글을 찾으면 PostResponseDto를 반환해야 한다', async () => {
      const mockPostModel = PostModel.from({
        id: '01936a7e-8f7e-7890-a5f9-3c8d9b2e1a4c',
        title: 'Test Title',
        content: 'Test Content',
        authorId: '01936a7e-8f7e-7890-a5f9-3c8d9b2e1a4d',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      });

      repository.findOne.mockResolvedValue(mockPostModel);

      const query = new GetPostQuery(mockPostModel.id);
      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(PostResponseDto);
    });

    it('게시글을 찾지 못하면 NotFoundException을 발생시켜야 한다', async () => {
      const postId = 'non-existent-id';
      repository.findOne.mockResolvedValue(null);

      const query = new GetPostQuery(postId);

      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      await expect(handler.execute(query)).rejects.toThrow(`게시글을 찾을 수 없습니다`);
    });
  });
});
