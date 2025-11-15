import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@modules/../app.module';
import { DataSource, Repository } from 'typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { PostModel } from '../infrastructure/post.model';
import { UserModelFactory } from '@test/factories/user.model.factory';
import { AccountModelFactory } from '@test/factories/account.model.factory';
import { truncate } from '@test/support/database.helper';
import { Application } from 'express';
import { setupApp } from '../../../../app.setup';
import { CreatePostRequestDto } from '../presentation/dto/create-post.request.dto';
import { v7 as uuidv7 } from 'uuid';

describe('PostHttpController', () => {
  let app: INestApplication<Application>;
  let dataSource: DataSource;
  let accountRepository: Repository<AccountModel>;
  let userRepository: Repository<UserModel>;
  let postRepository: Repository<PostModel>;
  let testAccount: AccountModel;
  let testUser: UserModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Application>>();
    setupApp(app);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    accountRepository = dataSource.getRepository(AccountModel);
    userRepository = dataSource.getRepository(UserModel);
    postRepository = dataSource.getRepository(PostModel);
  });

  beforeEach(async () => {
    await truncate([postRepository, userRepository, accountRepository]);
    AccountModelFactory.reset();
    UserModelFactory.reset();
    testAccount = AccountModelFactory.create();
    await accountRepository.save(testAccount);
    testUser = UserModelFactory.create({ accountId: testAccount.id });
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/posts - 게시글 생성', () => {
    it('유효한 요청으로 게시글을 성공적으로 생성한다', async () => {
      const createPostDto: CreatePostRequestDto = {
        authorId: testUser.id,
        content: 'This is a test post content.',
        title: 'Test Post Title',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/posts')
        .send(createPostDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      const savedPost = await postRepository.findOneOrFail({
        where: { id: response.body.id },
      });
      expect(savedPost.title).toBe(createPostDto.title);
      expect(savedPost.content).toBe(createPostDto.content);
      expect(savedPost.authorId).toBe(testUser.id);
    });

    describe('DTO 검증 - 필수 필드', () => {
      it('authorId가 없으면 400 에러를 반환한다', async () => {
        const createPostDto = {
          title: 'Test Post Title',
          content: 'This is a test post content.',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('제목이 없으면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          content: 'This is a test post content.',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('내용이 없으면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'Test Post Title',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });
    });

    describe('DTO 검증 - 타입 및 형식', () => {
      it('authorId가 유효한 UUID v7이 아니면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: 'invalid-uuid',
          title: 'Test Post Title',
          content: 'This is a test post content.',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('추가 필드가 제공되면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'Test Post Title',
          content: 'This is a test post content.',
          extraField: 'should not be allowed',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });
    });

    describe('DTO 검증 - 길이 제약', () => {
      it('제목이 빈 문자열이면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: '',
          content: 'This is a test post content.',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('내용이 빈 문자열이면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'Test Post Title',
          content: '',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('제목이 최대 길이(300자)를 초과하면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'a'.repeat(301),
          content: 'This is a test post content.',
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('내용이 최대 길이(100000자)를 초과하면 400 에러를 반환한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'Test Post Title',
          content: 'a'.repeat(100001),
        };

        await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
      });

      it('최대 길이(300자) 제목으로 게시글을 생성한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'a'.repeat(300),
          content: 'This is a test post content.',
        };

        const response = await request(app.getHttpServer())
          .post('/v1/posts')
          .send(createPostDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
      });

      it('최소 길이(1자) 제목으로 게시글을 생성한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'a',
          content: 'This is a test post content.',
        };

        const response = await request(app.getHttpServer())
          .post('/v1/posts')
          .send(createPostDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
      });

      it('최소 길이(1자) 내용으로 게시글을 생성한다', async () => {
        const createPostDto = {
          authorId: testUser.id,
          title: 'Test Post Title',
          content: 'a',
        };

        const response = await request(app.getHttpServer())
          .post('/v1/posts')
          .send(createPostDto)
          .expect(201);

        expect(response.body).toHaveProperty('id');
      });
    });

    describe('비즈니스 로직', () => {
      it('동일한 사용자가 여러 게시글을 생성할 수 있다', async () => {
        const firstPost = {
          authorId: testUser.id,
          title: 'First Post',
          content: 'First post content',
        };

        const secondPost = {
          authorId: testUser.id,
          title: 'Second Post',
          content: 'Second post content',
        };

        const response1 = await request(app.getHttpServer())
          .post('/v1/posts')
          .send(firstPost)
          .expect(201);

        const response2 = await request(app.getHttpServer())
          .post('/v1/posts')
          .send(secondPost)
          .expect(201);

        expect(response1.body.id).not.toBe(response2.body.id);

        const posts = await postRepository.find({ where: { authorId: testUser.id } });
        expect(posts).toHaveLength(2);
      });
    });
  });

  describe('GET /v1/posts/:id - 게시글 조회', () => {
    it('존재하는 게시글을 성공적으로 조회한다', async () => {
      const testPost = PostModel.from({
        id: uuidv7(),
        title: 'Test Post',
        content: 'Test Content',
        authorId: testUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await postRepository.save(testPost);

      const response = await request(app.getHttpServer())
        .get(`/v1/posts/${testPost.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPost.id,
        title: testPost.title,
        content: testPost.content,
        authorId: testUser.id,
      });
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('존재하지 않는 게시글 조회 시 404 에러를 반환한다', async () => {
      const nonExistentId = uuidv7();

      const response = await request(app.getHttpServer())
        .get(`/v1/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain('게시글을 찾을 수 없습니다');
    });

    it('유효하지 않은 UUID 형식으로 조회 시 400 에러를 반환한다', async () => {
      await request(app.getHttpServer()).get('/v1/posts/invalid-uuid').expect(400);
    });

    it('다른 사용자의 게시글도 조회할 수 있다', async () => {
      const anotherAccount = AccountModelFactory.create();
      await accountRepository.save(anotherAccount);
      const anotherUser = UserModelFactory.create({ accountId: anotherAccount.id });
      await userRepository.save(anotherUser);

      const anotherPost = PostModel.from({
        id: uuidv7(),
        title: 'Another User Post',
        content: 'Another User Content',
        authorId: anotherUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await postRepository.save(anotherPost);

      const response = await request(app.getHttpServer())
        .get(`/v1/posts/${anotherPost.id}`)
        .expect(200);

      expect(response.body.id).toBe(anotherPost.id);
      expect(response.body.authorId).toBe(anotherUser.id);
    });
  });
});
