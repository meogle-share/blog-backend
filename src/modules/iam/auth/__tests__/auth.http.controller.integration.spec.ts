import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@modules/../app.module';
import { DataSource, Repository } from 'typeorm';
import { PasswordCredentialModel } from '../infrastructure/password-credential.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { truncate } from '@test/support/database.helper';
import { Application } from 'express';
import { setupApp } from '../../../../app.setup';
import { decode } from 'jsonwebtoken';
import { JwtAccessTokenPayload } from '../infrastructure/types/json-web-token.interface';
import { UserModelFactory } from '@libs/typeorm/factories/user.model.factory';
import { PasswordCredentialModelFactory } from '@libs/typeorm/factories/password-credential.model.factory';
import * as argon2 from 'argon2';

const hashPassword = (password: string) =>
  argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });

describe('AuthHttpController', () => {
  let app: INestApplication<Application>;
  let dataSource: DataSource;
  let credentialRepository: Repository<PasswordCredentialModel>;
  let userRepository: Repository<UserModel>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Application>>();
    setupApp(app);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    credentialRepository = dataSource.getRepository(PasswordCredentialModel);
    userRepository = dataSource.getRepository(UserModel);
  });

  beforeEach(async () => {
    await truncate([credentialRepository, userRepository]);
    UserModelFactory.reset();
    PasswordCredentialModelFactory.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  const createUserWithCredential = async (email: string, password: string) => {
    const user = UserModelFactory.create(1, { email })[0];
    await userRepository.save(user);

    const credential = PasswordCredentialModelFactory.create(1, {
      userId: user.id,
      email,
      hashedPassword: await hashPassword(password),
    })[0];
    await credentialRepository.save(credential);

    return { user, credential };
  };

  describe('POST /v1/auth/login - 로그인', () => {
    it('유효한 자격증명으로 로그인에 성공한다', async () => {
      const password = 'validPassword123';
      const { user } = await createUserWithCredential('test@example.com', password);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', user.id);
      expect(response.body.user).toHaveProperty('nickname', user.nickname);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('발급된 토큰에 올바른 페이로드가 포함되어 있다', async () => {
      const password = 'validPassword123';
      const { user } = await createUserWithCredential('token-test@example.com', password);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'token-test@example.com',
          password: password,
        })
        .expect(200);

      const accessToken = response.body.accessToken;
      const decoded = decode(accessToken) as JwtAccessTokenPayload;

      expect(decoded).not.toBeNull();
      expect(decoded.sub).toBe(user.id);
      expect(decoded.email).toBe('token-test@example.com');
      expect(decoded.accountType).toBe('user');
      expect(decoded.iss).toBe('meogle-test');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('발급된 accessToken의 유효시간이 5분(300초)이다', async () => {
      const password = 'validPassword123';
      await createUserWithCredential('expiry-test@example.com', password);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          email: 'expiry-test@example.com',
          password: password,
        })
        .expect(200);

      const accessToken = response.body.accessToken;
      const decoded = decode(accessToken) as JwtAccessTokenPayload;

      const expiresInSeconds = decoded.exp - decoded.iat;
      expect(expiresInSeconds).toBe(300);
    });

    describe('인증 실패', () => {
      it('존재하지 않는 사용자로 로그인하면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'anyPassword123',
          })
          .expect(401);
      });

      it('잘못된 비밀번호로 로그인하면 401 에러를 반환한다', async () => {
        await createUserWithCredential('test@example.com', 'correctPassword123');

        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongPassword123',
          })
          .expect(401);
      });
    });

    describe('DTO 검증 - 필수 필드 (AuthGuard가 먼저 실행되어 401 반환)', () => {
      it('email이 없으면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            password: 'anyPassword123',
          })
          .expect(401);
      });

      it('password가 없으면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: 'test@example.com',
          })
          .expect(401);
      });
    });

    describe('DTO 검증 - 형식 (AuthGuard가 먼저 실행되어 401 반환)', () => {
      it('잘못된 이메일 형식이면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: 'invalid-email',
            password: 'anyPassword123',
          })
          .expect(401);
      });
    });

    describe('DTO 검증 - 길이 제약 (AuthGuard가 먼저 실행되어 401 반환)', () => {
      it('비밀번호가 최소 길이 미만이면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'short',
          })
          .expect(401);
      });
    });
  });
});
