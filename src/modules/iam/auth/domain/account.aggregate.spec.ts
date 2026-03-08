import { UserAccount } from './models/user-account.aggregate';
import { AccountUsername } from './models/account-username.vo';
import { AccountHashedPassword } from './models/account-hashed-password.vo';

describe('UserAccount Aggregate', () => {
  describe('create', () => {
    it('유효한 파라미터로 UserAccount를 생성해야 한다', () => {
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const account = UserAccount.create({
        username,
        password,
      });

      expect(account).toBeInstanceOf(UserAccount);
      expect(typeof account.id).toBe('string');
      expect(account.getProps().username).toBe(username);
      expect(account.getProps().password).toBe(password);
    });

    it('생성 시마다 고유한 ID를 가져야 한다', () => {
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const account1 = UserAccount.create({ username, password });
      const account2 = UserAccount.create({ username, password });

      expect(account1.id).not.toBe(account2.id);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 UserAccount를 재구성해야 한다', () => {
      const id = '01912345-6789-7abc-8555-123456789abc';
      const username = AccountUsername.from('existing@example.com');
      const password = AccountHashedPassword.from('existingPassword');

      const account = UserAccount.from({
        id,
        props: {
          username,
          password,
        },
      });

      expect(account).toBeInstanceOf(UserAccount);
      expect(account.id).toBe(id);
      expect(account.getProps().username).toBe(username);
      expect(account.getProps().password).toBe(password);
    });
  });
});
