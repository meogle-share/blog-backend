import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenProviderJwt } from '../infrastructure/token-provider.jwt';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

describe('TokenProviderJwt Integration', () => {
  let service: TokenProviderJwt;

  const TEST_SECRET = 'test-secret-key-for-integration-test';
  const TEST_UUID = '01912345-6789-7abc-8def-0123456789ab';
  const TEST_EMAIL = 'testuser@example.com';

  const createTestUser = (): User => {
    return User.from({
      id: TEST_UUID,
      props: {
        accountId: TEST_UUID,
        nickname: UserNickName.from('테스트유저'),
        email: UserEmail.from(TEST_EMAIL),
      },
    });
  };

  describe('기본 토큰 생성 및 검증', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          JwtModule.register({
            secret: TEST_SECRET,
            signOptions: { expiresIn: '1h' },
          }),
        ],
      }).compile();

      const jwtService = module.get<JwtService>(JwtService);
      service = new TokenProviderJwt(jwtService);
    });

    it('생성된 토큰을 검증하면 올바른 TokenInfo를 반환한다', () => {
      const user = createTestUser();

      const token = service.generate(user);
      const result = service.verify(token);

      expect(result).not.toBeNull();
      expect(result!.email).toBe(TEST_EMAIL);
      expect(result!.accountType).toBe('user');
      expect(result!.expiresAt).toBeInstanceOf(Date);
      expect(result!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('생성된 토큰은 JWT 형식이다', () => {
      const user = createTestUser();

      const token = service.generate(user);

      expect(token.split('.')).toHaveLength(3);
    });

    it('다른 secret으로 서명된 토큰은 검증에 실패한다', async () => {
      const user = createTestUser();
      const token = service.generate(user);

      const otherModule: TestingModule = await Test.createTestingModule({
        imports: [
          JwtModule.register({
            secret: 'different-secret-key',
            signOptions: { expiresIn: '1h' },
          }),
        ],
      }).compile();

      const otherJwtService = otherModule.get<JwtService>(JwtService);
      const otherService = new TokenProviderJwt(otherJwtService);

      const result = otherService.verify(token);

      expect(result).toBeNull();
    });
  });

  describe('토큰 만료 처리', () => {
    it('만료된 토큰은 null을 반환한다', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          JwtModule.register({
            secret: TEST_SECRET,
            signOptions: { expiresIn: '1ms' },
          }),
        ],
      }).compile();

      const jwtService = module.get<JwtService>(JwtService);
      service = new TokenProviderJwt(jwtService);

      const user = createTestUser();
      const token = service.generate(user);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = service.verify(token);

      expect(result).toBeNull();
    });
  });

  describe('잘못된 토큰 처리', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          JwtModule.register({
            secret: TEST_SECRET,
            signOptions: { expiresIn: '1h' },
          }),
        ],
      }).compile();

      const jwtService = module.get<JwtService>(JwtService);
      service = new TokenProviderJwt(jwtService);
    });

    it('빈 문자열 토큰은 null을 반환한다', () => {
      const result = service.verify('');

      expect(result).toBeNull();
    });

    it('임의의 문자열은 null을 반환한다', () => {
      const result = service.verify('not-a-valid-jwt-token');

      expect(result).toBeNull();
    });

    it('변조된 토큰은 null을 반환한다', () => {
      const user = createTestUser();
      const token = service.generate(user);

      const [header, payload, signature] = token.split('.');
      const tamperedToken = `${header}.${payload}x.${signature}`;

      const result = service.verify(tamperedToken);

      expect(result).toBeNull();
    });
  });
});
