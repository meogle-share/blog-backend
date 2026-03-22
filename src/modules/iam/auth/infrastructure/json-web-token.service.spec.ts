import { TokenProviderJwt } from './token-provider.jwt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';
import { JwtAccessTokenPayload } from './types/json-web-token.interface';

describe('TokenProviderJwt', () => {
  let service: TokenProviderJwt;
  let jwtService: jest.Mocked<JwtService>;

  const TEST_UUID = '01912345-6789-7abc-8def-0123456789ab';
  const TEST_EMAIL = 'test@example.com';
  const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const TEST_PAYLOAD: JwtAccessTokenPayload = {
    sub: TEST_UUID,
    email: TEST_EMAIL,
    accountType: 'user',
    exp: 1733520000,
    iat: 1733519700,
  };

  beforeEach(() => {
    jwtService = {
      sign: jest.fn().mockReturnValue(TEST_TOKEN),
      verify: jest.fn().mockReturnValue(TEST_PAYLOAD),
    } as unknown as jest.Mocked<JwtService>;

    service = new TokenProviderJwt(jwtService);
  });

  describe('generate', () => {
    it('User 정보를 기반으로 JWT 토큰을 생성한다', () => {
      const user = User.from({
        id: TEST_UUID,
        props: {
          nickname: UserNickName.from('테스트유저'),
          email: UserEmail.from(TEST_EMAIL),
        },
      });

      const token = service.generate(user);

      expect(token).toBe(TEST_TOKEN);
    });

    it('JwtService.sign()에 올바른 payload를 전달한다', () => {
      const user = User.from({
        id: TEST_UUID,
        props: {
          nickname: UserNickName.from('테스트유저'),
          email: UserEmail.from(TEST_EMAIL),
        },
      });

      service.generate(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: TEST_UUID,
        email: TEST_EMAIL,
        accountType: 'user',
      });
    });

    it('email이 null인 User의 토큰을 생성한다', () => {
      const user = User.from({
        id: TEST_UUID,
        props: {
          nickname: UserNickName.from('테스트유저'),
          email: null,
        },
      });

      service.generate(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: TEST_UUID,
        email: null,
        accountType: 'user',
      });
    });
  });

  describe('verify', () => {
    it('유효한 토큰 검증 시 TokenInfo를 반환한다', () => {
      const result = service.verify(TEST_TOKEN);

      expect(result).toEqual({
        email: TEST_EMAIL,
        accountType: 'user',
        expiresAt: new Date(TEST_PAYLOAD.exp * 1000),
      });
    });

    it('JwtService.verify()에 토큰을 전달한다', () => {
      service.verify(TEST_TOKEN);

      expect(jwtService.verify).toHaveBeenCalledWith(TEST_TOKEN);
    });

    it('유효하지 않은 토큰 검증 시 null을 반환한다', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const result = service.verify('invalid-token');

      expect(result).toBeNull();
    });

    it('만료된 토큰 검증 시 null을 반환한다', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const result = service.verify(TEST_TOKEN);

      expect(result).toBeNull();
    });
  });
});
