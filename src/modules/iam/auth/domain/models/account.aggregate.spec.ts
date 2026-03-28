import { Account } from './account.aggregate';
import { AccountProvider, Provider } from './account-provider.vo';
import { ProviderId } from './provider-id.vo';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

describe('Account Aggregate', () => {
  describe('createWithOAuth', () => {
    it('OAuth 정보로 Account를 생성한다', () => {
      const account = Account.createWithOAuth({
        provider: AccountProvider.from(Provider.GITHUB),
        providerAccountId: ProviderId.from('12345'),
        providerLogin: 'octocat',
      });

      expect(account).toBeInstanceOf(Account);
      expect(typeof account.id).toBe('string');
      expect(account.getProps().oauthAccounts).toHaveLength(1);
      expect(account.getProps().passwordCredential).toBeNull();
    });

    it('OAuth 계정의 provider 정보가 올바르다', () => {
      const account = Account.createWithOAuth({
        provider: AccountProvider.from(Provider.GITHUB),
        providerAccountId: ProviderId.from('12345'),
        providerLogin: 'octocat',
      });

      const oauthAccount = account.getProps().oauthAccounts[0];
      expect(oauthAccount.getProps().provider.value).toBe('github');
      expect(oauthAccount.getProps().providerAccountId.value).toBe('12345');
      expect(oauthAccount.getProps().providerLogin).toBe('octocat');
    });
  });

  describe('createWithPassword', () => {
    it('비밀번호 정보로 Account를 생성한다', () => {
      const account = Account.createWithPassword({
        email: UserEmail.from('user@example.com'),
        hashedPassword: AccountHashedPassword.from('hashedPw123'),
      });

      expect(account).toBeInstanceOf(Account);
      expect(account.getProps().oauthAccounts).toHaveLength(0);
      expect(account.getProps().passwordCredential).not.toBeNull();
    });

    it('credential의 이메일 정보가 올바르다', () => {
      const account = Account.createWithPassword({
        email: UserEmail.from('user@example.com'),
        hashedPassword: AccountHashedPassword.from('hashedPw123'),
      });

      const credential = account.getProps().passwordCredential!;
      expect(credential.getProps().email.value).toBe('user@example.com');
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 Account를 재구성한다', () => {
      const id = '01912345-6789-7abc-8def-0123456789ab';

      const account = Account.from({
        id,
        props: {
          oauthAccounts: [],
          passwordCredential: null,
        },
      });

      expect(account.id).toBe(id);
    });
  });
});
