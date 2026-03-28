import { OAuthAccount } from './oauth-account.entity';
import { AccountProvider, Provider } from './account-provider.vo';
import { ProviderId } from './provider-id.vo';

describe('OAuthAccount Entity', () => {
  describe('create', () => {
    it('유효한 파라미터로 OAuthAccount를 생성해야 한다', () => {
      const account = OAuthAccount.create({
        provider: AccountProvider.from(Provider.GITHUB),
        providerAccountId: ProviderId.from('12345'),
        providerLogin: 'octocat',
      });

      expect(account).toBeInstanceOf(OAuthAccount);
      expect(typeof account.id).toBe('string');
      expect(account.getProps().provider.value).toBe('github');
      expect(account.getProps().providerAccountId.value).toBe('12345');
      expect(account.getProps().providerLogin).toBe('octocat');
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 OAuthAccount를 재구성해야 한다', () => {
      const id = '01912345-6789-7abc-8555-123456789abc';

      const account = OAuthAccount.from({
        id,
        props: {
          provider: AccountProvider.from(Provider.GITHUB),
          providerAccountId: ProviderId.from('99999'),
          providerLogin: 'testuser',
        },
      });

      expect(account.id).toBe(id);
      expect(account.getProps().providerLogin).toBe('testuser');
    });
  });
});
