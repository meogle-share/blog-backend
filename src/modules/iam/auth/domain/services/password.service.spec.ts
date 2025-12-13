import { PasswordService } from './password.service';
import type { IPasswordHashService } from '@modules/iam/auth/domain/password-hash.service.interface';
import { AccountHashedPassword } from '@modules/iam/auth/domain/value-objects/account-hashed-password.vo';

describe('PasswordService', () => {
  let passwordService: PasswordService;
  let mockPasswordHashService: jest.Mocked<IPasswordHashService>;

  beforeEach(() => {
    mockPasswordHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    passwordService = new PasswordService(mockPasswordHashService);
  });

  describe('verifyPassword', () => {
    const inputPassword = 'plainPassword123';
    const hashedPassword = AccountHashedPassword.from('$2b$10$hashedPasswordValue');

    it('비밀번호가 일치하면 true를 반환한다', async () => {
      mockPasswordHashService.compare.mockResolvedValue(true);

      const result = await passwordService.verifyPassword(inputPassword, hashedPassword);

      expect(result).toBe(true);
      expect(mockPasswordHashService.compare).toHaveBeenCalledWith(
        inputPassword,
        hashedPassword.value,
      );
    });

    it('비밀번호가 일치하지 않으면 false를 반환한다', async () => {
      mockPasswordHashService.compare.mockResolvedValue(false);

      const result = await passwordService.verifyPassword(inputPassword, hashedPassword);

      expect(result).toBe(false);
      expect(mockPasswordHashService.compare).toHaveBeenCalledWith(
        inputPassword,
        hashedPassword.value,
      );
    });

    it('passwordHashService.compare를 올바른 인자로 호출한다', async () => {
      mockPasswordHashService.compare.mockResolvedValue(true);

      await passwordService.verifyPassword(inputPassword, hashedPassword);

      expect(mockPasswordHashService.compare).toHaveBeenCalledTimes(1);
      expect(mockPasswordHashService.compare).toHaveBeenCalledWith(
        inputPassword,
        hashedPassword.value,
      );
    });
  });
});