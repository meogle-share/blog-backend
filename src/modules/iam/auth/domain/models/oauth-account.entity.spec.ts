import { OAuthAccount } from './oauth-account.entity';
import { AccountProvider, Provider } from './account-provider.vo';
import { ProviderId } from './provider-id.vo';
import { generateId } from '@libs/ddd';

describe('OAuthAccount Entity', () => {
  describe('create', () => {
    it('유효한 파라미터로 OAuthAccount를 생성해야 한다', () => {
      const userId = generateId();
      const provider = AccountProvider.from(Provider.GITHUB);
      const providerAccountId = ProviderId.from('12345');
      const providerLogin = 'octocat';

      const account = OAuthAccount.create({
        userId,
        provider,
        providerAccountId,
        providerLogin,
      });

      expect(account).toBeInstanceOf(OAuthAccount);
      expect(typeof account.id).toBe('string');
      expect(account.getProps().userId).toBe(userId);
      expect(account.getProps().provider.value).toBe('github');
      expect(account.getProps().providerAccountId.value).toBe('12345');
      expect(account.getProps().providerLogin).toBe('octocat');
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 OAuthAccount를 재구성해야 한다', () => {
      const id = '01912345-6789-7abc-8555-123456789abc';
      const userId = generateId();

      const account = OAuthAccount.from({
        id,
        props: {
          userId,
          provider: AccountProvider.from(Provider.GITHUB),
          providerAccountId: ProviderId.from('99999'),
          providerLogin: 'testuser',
        },
      });

      expect(account.id).toBe(id);
      expect(account.getProps().userId).toBe(userId);
    });
  });
});
