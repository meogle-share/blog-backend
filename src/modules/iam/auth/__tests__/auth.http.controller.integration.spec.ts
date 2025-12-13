import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@modules/../app.module';
import { DataSource, Repository } from 'typeorm';
import { AccountModel } from '../infrastructure/account.model';
import { truncate } from '@test/support/database.helper';
import { Application } from 'express';
import { setupApp } from '../../../../app.setup';
import { decode } from 'jsonwebtoken';
import { JwtAccessTokenPayload } from '../infrastructure/types/json-web-token.interface';
import { AccountModelFactory } from '@libs/typeorm/factories/account.model.factory';
import { hashSync } from 'bcrypt';

describe('AuthHttpController', () => {
  let app: INestApplication<Application>;
  let dataSource: DataSource;
  let accountRepository: Repository<AccountModel>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication<Application>>();
    setupApp(app);
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    accountRepository = dataSource.getRepository(AccountModel);
  });

  beforeEach(async () => {
    await truncate([accountRepository]);
    AccountModelFactory.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/auth/login - 로그인', () => {
    it('유효한 자격증명으로 로그인에 성공한다', async () => {
      const password = 'validPassword123';
      const testAccount = AccountModelFactory.create(1, {
        username: 'test@example.com',
        password: hashSync(password, 12),
      })[0];
      await accountRepository.save(testAccount);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          username: 'test@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('account');
      expect(response.body.account).toHaveProperty('id', testAccount.id);
      expect(response.body.account).toHaveProperty('username', 'test@example.com');
    });

    it('발급된 토큰에 올바른 페이로드가 포함되어 있다', async () => {
      const password = 'validPassword123';
      const testAccount = AccountModelFactory.create(1, {
        username: 'token-test@example.com',
        password: hashSync(password, 12),
      })[0];
      await accountRepository.save(testAccount);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          username: 'token-test@example.com',
          password: password,
        })
        .expect(200);

      const accessToken = response.body.accessToken;
      const decoded = decode(accessToken) as JwtAccessTokenPayload;

      expect(decoded).not.toBeNull();
      expect(decoded.sub).toBe(testAccount.id);
      expect(decoded.username).toBe('token-test@example.com');
      expect(decoded.iss).toBe('meogle-test');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('발급된 accessToken의 유효시간이 5분(300초)이다', async () => {
      const password = 'validPassword123';
      const testAccount = AccountModelFactory.create(1, {
        username: 'expiry-test@example.com',
        password: hashSync(password, 12),
      })[0];
      await accountRepository.save(testAccount);

      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({
          username: 'expiry-test@example.com',
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
            username: 'nonexistent@example.com',
            password: 'anyPassword123',
          })
          .expect(401);
      });

      it('잘못된 비밀번호로 로그인하면 401 에러를 반환한다', async () => {
        const testAccount = AccountModelFactory.create(1, {
          username: 'test@example.com',
          password: hashSync('correctPassword123', 12),
        })[0];
        await accountRepository.save(testAccount);

        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            username: 'test@example.com',
            password: 'wrongPassword123',
          })
          .expect(401);
      });
    });

    describe('DTO 검증 - 필수 필드 (AuthGuard가 먼저 실행되어 401 반환)', () => {
      it('username이 없으면 401 에러를 반환한다', async () => {
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
            username: 'test@example.com',
          })
          .expect(401);
      });
    });

    describe('DTO 검증 - 형식 (AuthGuard가 먼저 실행되어 401 반환)', () => {
      it('잘못된 이메일 형식이면 401 에러를 반환한다', async () => {
        await request(app.getHttpServer())
          .post('/v1/auth/login')
          .send({
            username: 'invalid-email',
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
            username: 'test@example.com',
            password: 'short',
          })
          .expect(401);
      });
    });
  });
});
