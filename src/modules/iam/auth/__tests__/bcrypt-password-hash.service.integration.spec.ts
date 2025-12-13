import { BcryptPasswordHashService } from '../infrastructure/bcrypt-password-hash.service';

describe('BcryptPasswordHashService', () => {
  let service: BcryptPasswordHashService;

  beforeEach(() => {
    service = new BcryptPasswordHashService();
  });

  describe('hash', () => {
    it('평문 비밀번호를 해싱하면 원본과 다른 문자열을 반환한다', async () => {
      const plainPassword = 'mySecretPassword123';

      const hashedPassword = await service.hash(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt 해시 형식
    });

    it('같은 비밀번호를 해싱해도 매번 다른 해시가 생성된다', async () => {
      const plainPassword = 'mySecretPassword123';

      const hash1 = await service.hash(plainPassword);
      const hash2 = await service.hash(plainPassword);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('올바른 비밀번호와 해시를 비교하면 true를 반환한다', async () => {
      const plainPassword = 'mySecretPassword123';
      const hashedPassword = await service.hash(plainPassword);

      const result = await service.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('틀린 비밀번호와 해시를 비교하면 false를 반환한다', async () => {
      const plainPassword = 'mySecretPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await service.hash(plainPassword);

      const result = await service.compare(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
