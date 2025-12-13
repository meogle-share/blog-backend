import { Account } from './account.aggregate';
import { AccountId } from './value-objects/account-id.vo';
import { AccountUsername } from './value-objects/account-username.vo';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id.vo';
import { AccountHashedPassword } from '@modules/iam/auth/domain/value-objects/account-hashed-password.vo';

describe('Account Aggregate', () => {
  describe('create', () => {
    it('유효한 파라미터로 Account를 생성해야 한다', () => {
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const account = Account.create({
        username,
        password,
      });

      expect(account).toBeInstanceOf(Account);
      expect(account.id).toBeInstanceOf(AccountId);
      expect(account.getProps().username).toBe(username);
      expect(account.getProps().password).toBe(password);
    });

    it('생성 시마다 고유한 ID를 가져야 한다', () => {
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const account1 = Account.create({ username, password });
      const account2 = Account.create({ username, password });

      expect(account1.id.equals(account2.id)).toBe(false);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 Account를 재구성해야 한다', () => {
      const userId = UserId.from('01912345-6789-7abc-8555-123456789abc');
      const username = AccountUsername.from('existing@example.com');
      const password = AccountHashedPassword.from('existingPassword');

      const account = Account.from({
        id: userId,
        props: {
          username,
          password,
        },
      });

      expect(account).toBeInstanceOf(Account);
      expect(account.id).toBe(userId);
      expect(account.getProps().username).toBe(username);
      expect(account.getProps().password).toBe(password);
    });
  });
});
