import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostRepositoryImpl } from '../infrastructure/post.repository.impl';
import { PostModel } from '../infrastructure/post.model';
import { PostMapper } from '../infrastructure/post.mapper';
import { Post } from '../domain/post.aggregate';
import { PostId } from '../domain/value-objects/post-id';
import { PostTitle } from '../domain/value-objects/post-title';
import { PostContent } from '../domain/value-objects/post-content';
import { UserId } from '../../../iam/user/domain/value-objects/user-id';
import { getDataSourceOptionsForNest } from '@configs/database.config';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { truncate } from '@test/support/database.helper';
import { UserModelFactory } from '@test/factories/user.model.factory';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AccountModelFactory } from '@test/factories/account.model.factory';

describe('PostRepositoryImpl', () => {
  let postRepository: PostRepositoryImpl;
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
      providers: [PostRepositoryImpl, PostMapper],
    }).compile();

    postRepository = module.get<PostRepositoryImpl>(PostRepositoryImpl);
    postModelRepo = module.get<Repository<PostModel>>(getRepositoryToken(PostModel));
    userModelRepo = module.get<Repository<UserModel>>(getRepositoryToken(UserModel));
    accountModelRepo = module.get<Repository<AccountModel>>(getRepositoryToken(AccountModel));
  });

  beforeEach(async () => {
    await truncate([postModelRepo, userModelRepo, accountModelRepo]);
    const testAccount = AccountModelFactory.create();
    await accountModelRepo.save(testAccount);
    testUser = UserModelFactory.create({ accountId: testAccount.id });
    await userModelRepo.save(testUser);
  });

  afterAll(async () => {
    await truncate([postModelRepo, userModelRepo, accountModelRepo]);
    await module.close();
  });

  describe('save', () => {
    it('새로운 Post를 DB에 저장해야 한다', async () => {
      const post = Post.create({
        authorId: UserId.from(testUser.id),
        title: PostTitle.from('Integration Test Post'),
        content: PostContent.from('This is an integration test'),
      });

      const savedPost = await postRepository.save(post);
      expect(savedPost).toBeInstanceOf(Post);
      expect(savedPost.id).toBeDefined();

      const foundModel = await postModelRepo.findOne({
        where: { id: savedPost.id.value },
      });

      expect(foundModel!.authorId).toBe(testUser.id);
      expect(foundModel!.title).toBe('Integration Test Post');
      expect(foundModel!.content).toBe('This is an integration test');
    });

    it('저장된 Post는 createdAt과 updatedAt이 설정되어야 한다', async () => {
      const post = Post.create({
        authorId: UserId.from(testUser.id),
        title: PostTitle.from('Test Title'),
        content: PostContent.from('Test content'),
      });

      const savedPost = await postRepository.save(post);
      expect(savedPost.getProps().createdAt).toBeInstanceOf(Date);
      expect(savedPost.getProps().updatedAt).toBeInstanceOf(Date);

      const foundModel = await postModelRepo.findOne({
        where: { id: savedPost.id.value },
      });
      expect(foundModel!.createdAt).toBeInstanceOf(Date);
      expect(foundModel!.updatedAt).toBeInstanceOf(Date);
    });

    it('여러 개의 Post를 저장할 수 있어야 한다', async () => {
      const post1 = Post.create({
        authorId: UserId.from(testUser.id),
        title: PostTitle.from('Post 1'),
        content: PostContent.from('Content 1'),
      });

      const post2 = Post.create({
        authorId: UserId.from(testUser.id),
        title: PostTitle.from('Post 2'),
        content: PostContent.from('Content 2'),
      });

      await postRepository.save(post1);
      await postRepository.save(post2);

      const count = await postModelRepo.count();
      expect(count).toBe(2);
    });

    it('동일한 ID로 저장하면 업데이트되어야 한다', async () => {
      const postId = PostId.generate();
      const post1 = Post.from({
        id: postId,
        props: {
          authorId: UserId.from(testUser.id),
          title: PostTitle.from('Original Title'),
          content: PostContent.from('Original content'),
        },
      });

      await postRepository.save(post1);

      const post2 = Post.from({
        id: postId,
        props: {
          authorId: UserId.from(testUser.id),
          title: PostTitle.from('Updated Title'),
          content: PostContent.from('Updated content'),
        },
      });

      await postRepository.save(post2);

      const count = await postModelRepo.count();
      expect(count).toBe(1);

      const foundModel = await postModelRepo.findOne({
        where: { id: postId.value },
      });
      expect(foundModel!.title).toBe('Updated Title');
      expect(foundModel!.content).toBe('Updated content');
    });
  });
});
