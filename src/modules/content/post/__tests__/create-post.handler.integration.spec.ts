import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from '../application/commands/create-post.handler';
import { CreatePostCommand } from '../application/commands/create-post.command';
import { PostRepositoryImpl } from '../infrastructure/post.repository.impl';
import { PostModel } from '../infrastructure/post.model';
import { PostMapper } from '../infrastructure/post.mapper';
import { POST_REPOSITORY } from '../domain/post.repository.interface';
import { Post } from '../domain/post.aggregate';
import { PostTitle } from '../domain/value-objects/post-title';
import { PostContent } from '../domain/value-objects/post-content';
import { UserId } from '../../../iam/user/domain/value-objects/user-id';
import { getDatabaseConfig } from '@configs/database.config';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@test/factories/user.model.factory';

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;
  let postModelRepo: Repository<PostModel>;
  let userModelRepo: Repository<UserModel>;
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
          useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
        }),
        TypeOrmModule.forFeature([PostModel, UserModel]),
        CqrsModule,
      ],
      providers: [
        {
          provide: POST_REPOSITORY,
          useClass: PostRepositoryImpl,
        },
        CreatePostHandler,
        PostMapper,
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
    postModelRepo = module.get<Repository<PostModel>>(getRepositoryToken(PostModel));
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
  });

  beforeEach(async () => {
    await truncate([postModelRepo, userModelRepo]);
    testUser = UserModelFactory.create();
    await userModelRepo.save(testUser);
  });

  afterAll(async () => {
    await truncate([postModelRepo, userModelRepo]);
    await module.close();
  });

  describe('execute', () => {
    describe('전체 플로우', () => {
      it('Command -> Handler -> Domain -> Repository -> DB 전체 흐름이 정상 동작해야 한다', async () => {
        const command = new CreatePostCommand(
          testUser.id,
          'Integration Test Post',
          'This is an integration test content',
        );

        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(Post);
        expect(result.id).toBeDefined();
        expect(result.getProps().authorId.value).toBe(testUser.id);
        expect(result.getProps().title.value).toBe('Integration Test Post');
        expect(result.getProps().content.value).toBe('This is an integration test content');

        const savedModel = await postModelRepo.findOne({
          where: { id: result.id.value },
        });

        expect(savedModel).toBeDefined();
        expect(savedModel!.authorId).toBe(testUser.id);
        expect(savedModel!.title).toBe('Integration Test Post');
        expect(savedModel!.content).toBe('This is an integration test content');
        expect(savedModel!.createdAt).toBeInstanceOf(Date);
        expect(savedModel!.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('트랜잭션 및 롤백', () => {
      it('제목 검증 실패 시 트랜잭션이 롤백되어 DB에 저장되지 않아야 한다', async () => {
        const tooLongTitle = 'A'.repeat(PostTitle.MAX_LENGTH + 1);
        const command = new CreatePostCommand(testUser.id, tooLongTitle, 'Valid content');

        await expect(handler.execute(command)).rejects.toThrow();

        const count = await postModelRepo.count();
        expect(count).toBe(0);
      });

      it('내용 검증 실패 시 트랜잭션이 롤백되어 DB에 저장되지 않아야 한다', async () => {
        const tooLongContent = 'A'.repeat(PostContent.MAX_LENGTH + 1);
        const command = new CreatePostCommand(testUser.id, 'Valid title', tooLongContent);

        await expect(handler.execute(command)).rejects.toThrow();

        const count = await postModelRepo.count();
        expect(count).toBe(0);
      });

      it('빈 제목으로 인한 검증 실패 시 트랜잭션이 롤백되어야 한다', async () => {
        const command = new CreatePostCommand(testUser.id, '', 'Valid content');

        await expect(handler.execute(command)).rejects.toThrow();

        const count = await postModelRepo.count();
        expect(count).toBe(0);
      });

      it('빈 내용으로 인한 검증 실패 시 트랜잭션이 롤백되어야 한다', async () => {
        const command = new CreatePostCommand(testUser.id, 'Valid title', '');

        await expect(handler.execute(command)).rejects.toThrow();

        const count = await postModelRepo.count();
        expect(count).toBe(0);
      });

      it('FK 제약조건 위반 시 트랜잭션이 롤백되어야 한다', async () => {
        const nonExistentAuthorId = UserId.generate().value;
        const command = new CreatePostCommand(nonExistentAuthorId, 'Test Title', 'Test Content');

        await expect(handler.execute(command)).rejects.toThrow();

        const count = await postModelRepo.count();
        expect(count).toBe(0);
      });
    });
  });
});
