import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { GetPostHandler } from '../application/queries/get-post.handler';
import { GetPostQuery } from '../application/queries/get-post.query';
import { PostModel } from '../infrastructure/post.model';
import { PostResponseDto } from '../presentation/dto/post.response.dto';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@test/factories/user.model.factory';
import { AccountModelFactory } from '@test/factories/account.model.factory';
import { v7 as uuidv7 } from 'uuid';

describe('GetPostHandler', () => {
  let handler: GetPostHandler;
  let postModelRepo: Repository<PostModel>;
  let userModelRepo: Repository<UserModel>;
  let accountModelRepo: Repository<AccountModel>;
  let module: TestingModule;
  let testUser: UserModel;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => getDataSourceOptionsForNest(configService),
        }),
        TypeOrmModule.forFeature([AccountModel, PostModel, UserModel]),
      ],
      providers: [GetPostHandler],
    }).compile();

    handler = module.get<GetPostHandler>(GetPostHandler);
    postModelRepo = module.get<Repository<PostModel>>(getRepositoryToken(PostModel));
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
    accountModelRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
  });

  beforeEach(async () => {
    await truncate([postModelRepo, userModelRepo, accountModelRepo]);
    const testAccount = AccountModelFactory.create(1)[0];
    await accountModelRepo.save(testAccount);
    testUser = UserModelFactory.create(1, { accountId: testAccount.id })[0];
    await userModelRepo.save(testUser);
  });

  afterAll(async () => {
    await truncate([postModelRepo, userModelRepo, accountModelRepo]);
    await module.close();
  });

  describe('execute', () => {
    describe('전체 플로우', () => {
      it('Query -> Handler -> DB 조회 -> DTO 변환 전체 흐름이 정상 동작해야 한다', async () => {
        const testPost = PostModel.from({
          id: uuidv7(),
          title: 'Test Post Title',
          content: 'Test Post Content',
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await postModelRepo.save(testPost);

        const query = new GetPostQuery(testPost.id);
        const result = await handler.execute(query);

        expect(result).toBeInstanceOf(PostResponseDto);
        expect(result.id).toBe(testPost.id);
        expect(result.title).toBe('Test Post Title');
        expect(result.content).toBe('Test Post Content');
        expect(result.authorId).toBe(testUser.id);
        expect(result.createdAt).toBe(testPost.createdAt.toISOString());
        expect(result.updatedAt).toBe(testPost.updatedAt.toISOString());
      });

      it('DB에 저장된 게시글의 모든 필드가 DTO에 정확히 매핑되어야 한다', async () => {
        const now = new Date();
        const testPost = PostModel.from({
          id: uuidv7(),
          title: 'Integration Test',
          content: 'Integration Test Content with special characters !@#$%',
          authorId: testUser.id,
          createdAt: now,
          updatedAt: now,
        });
        await postModelRepo.save(testPost);

        const query = new GetPostQuery(testPost.id);
        const result = await handler.execute(query);

        expect(result.id).toBe(testPost.id);
        expect(result.title).toBe(testPost.title);
        expect(result.content).toBe(testPost.content);
        expect(result.authorId).toBe(testPost.authorId);
        expect(result.createdAt).toBe(testPost.createdAt.toISOString());
        expect(result.updatedAt).toBe(testPost.updatedAt.toISOString());
      });
    });

    describe('예외 처리', () => {
      it('존재하지 않는 게시글 ID로 조회 시 NotFoundException을 던져야 한다', async () => {
        const nonExistentPostId = uuidv7();
        const query = new GetPostQuery(nonExistentPostId);

        await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
        await expect(handler.execute(query)).rejects.toThrow('게시글을 찾을 수 없습니다');
      });

      it('삭제된 게시글 조회 시 NotFoundException을 던져야 한다', async () => {
        const testPost = PostModel.from({
          id: uuidv7(),
          title: 'To Be Deleted',
          content: 'This post will be deleted',
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await postModelRepo.save(testPost);
        await postModelRepo.delete({ id: testPost.id });

        const query = new GetPostQuery(testPost.id);

        await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
      });
    });

    describe('데이터 일관성', () => {
      it('여러 게시글이 있을 때 정확한 게시글을 조회해야 한다', async () => {
        const post1 = PostModel.from({
          id: uuidv7(),
          title: 'Post 1',
          content: 'Content 1',
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const post2 = PostModel.from({
          id: uuidv7(),
          title: 'Post 2',
          content: 'Content 2',
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const post3 = PostModel.from({
          id: uuidv7(),
          title: 'Post 3',
          content: 'Content 3',
          authorId: testUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await postModelRepo.save([post1, post2, post3]);

        const query = new GetPostQuery(post2.id);
        const result = await handler.execute(query);

        expect(result.id).toBe(post2.id);
        expect(result.title).toBe('Post 2');
        expect(result.content).toBe('Content 2');
      });
    });
  });
});
