import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PostModel } from '@modules/content/post/infrastructure/post.model';
import { UserModelFactory } from '../factories/user.model.factory';
import { truncate } from '../support/database.helper';
import { Application } from 'express';
import { setupApp } from '../../src/app.setup';
import { CreatePostRequestDto } from '@modules/content/post/presentation/dto/create-post.request.dto';

describe('Post', () => {
  let app: INestApplication<Application>;
  let dataSource: DataSource;
  let userRepository: Repository<UserModel>;
  let postRepository: Repository<PostModel>;
  let testUser: UserModel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Application>>();
    setupApp(app);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(UserModel);
    postRepository = dataSource.getRepository(PostModel);
  });

  beforeEach(async () => {
    await truncate([postRepository, userRepository]);
    UserModelFactory.reset();
    testUser = UserModelFactory.create();
    await userRepository.save(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/posts - 게시글 생성', () => {
    it('게시글을 성공적으로 생성한다', async () => {
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

    it('authorId가 없으면 실패한다', async () => {
      const createPostDto = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('제목이 없으면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        content: 'This is a test post content.',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('내용이 없으면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        title: 'Test Post Title',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('authorId가 유효한 UUID v7이 아니면 실패한다', async () => {
      const createPostDto = {
        authorId: 'invalid-uuid',
        title: 'Test Post Title',
        content: 'This is a test post content.',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('제목이 빈 문자열이면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        title: '',
        content: 'This is a test post content.',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('내용이 빈 문자열이면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        title: 'Test Post Title',
        content: '',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('제목이 최대 길이(300자)를 초과하면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        title: 'a'.repeat(301),
        content: 'This is a test post content.',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('내용이 최대 길이(100000자)를 초과하면 실패한다', async () => {
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

    it('추가 필드가 제공되면 실패한다', async () => {
      const createPostDto = {
        authorId: testUser.id,
        title: 'Test Post Title',
        content: 'This is a test post content.',
        extraField: 'should not be allowed',
      };

      await request(app.getHttpServer()).post('/v1/posts').send(createPostDto).expect(400);
    });

    it('동일한 사용자가 여러 게시글을 생성한다', async () => {
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
