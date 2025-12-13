import { AccountHashedPassword } from './account-hashed-password.vo';

describe('AccountHashedPassword', () => {
  describe('from', () => {
    it('유효한 해시된 비밀번호로 AccountHashedPassword를 생성해야 한다', () => {
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv';
      const accountHashedPassword = AccountHashedPassword.from(hashedPassword);

      expect(accountHashedPassword).toBeInstanceOf(AccountHashedPassword);
      expect(accountHashedPassword.value).toBe(hashedPassword);
    });

    it('다양한 형식의 해시 값을 허용해야 한다', () => {
      const validHashedPasswords = [
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3sMPhNfGnOEXcLhNhXui', // bcrypt
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$hash', // argon2
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA-256
        'simple-hash-value', // 단순 해시 값
      ];

      validHashedPasswords.forEach((hash) => {
        const accountHashedPassword = AccountHashedPassword.from(hash);
        expect(accountHashedPassword.value).toBe(hash);
      });
    });

    it('빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => AccountHashedPassword.from('')).toThrow('비밀번호는 필수입니다');
    });
  });
});