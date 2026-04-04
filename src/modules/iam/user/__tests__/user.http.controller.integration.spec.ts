import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@modules/../app.module';
import { DataSource, Repository } from 'typeorm';
import { UserModel } from '../infrastructure/user.model';
import { loginAs } from '@test/support/auth.helper';
import { truncate } from '@test/support/database.helper';
import { Application } from 'express';
import { setupApp } from '../../../../app.setup';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';

describe('UserHttpController', () => {
  let app: INestApplication<Application>;
  let dataSource: DataSource;
  let userRepository: Repository<UserModel>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Application>>();
    setupApp(app);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = dataSource.getRepository(UserModel);
  });

  beforeEach(async () => {
    await truncate([userRepository]);
    UserModelFactory.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  const createAuthenticatedUser = async (email: string) => {
    const [user] = UserModelFactory.create(1, { email });
    await userRepository.save(user);
    const accessToken = loginAs(app, user);
    return { user, accessToken };
  };

  describe('GET /v1/users/me', () => {
    it('Bearer 토큰으로 본인 정보를 조회한다', async () => {
      const { user, accessToken } = await createAuthenticatedUser('me@example.com');

      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: user.id,
        nickname: user.nickname,
        email: 'me@example.com',
      });
    });

    it('쿠키로 본인 정보를 조회한다', async () => {
      const { user, accessToken } = await createAuthenticatedUser('cookie@example.com');

      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Cookie', `access_token=${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: user.id,
        nickname: user.nickname,
        email: 'cookie@example.com',
      });
    });

    it('토큰이 없으면 401을 반환한다', async () => {
      await request(app.getHttpServer()).get('/v1/users/me').expect(401);
    });

    it('유효하지 않은 토큰이면 401을 반환한다', async () => {
      await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
