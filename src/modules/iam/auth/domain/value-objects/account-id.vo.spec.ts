import { AccountId } from './account-id.vo';

describe('AccountId', () => {
  describe('generate', () => {
    it('UUID 형식의 AccountId를 생성해야 한다', () => {
      const accountId = AccountId.generate();

      expect(accountId).toBeInstanceOf(AccountId);
      expect(accountId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('매번 다른 UUID를 생성해야 한다', () => {
      const accountId1 = AccountId.generate();
      const accountId2 = AccountId.generate();

      expect(accountId1.value).not.toBe(accountId2.value);
    });
  });

  describe('from', () => {
    it('주어진 문자열로 AccountId를 생성해야 한다', () => {
      const idValue = '01912345-6789-7abc-8888-123456789abc';

      const accountId = AccountId.from(idValue);

      expect(accountId).toBeInstanceOf(AccountId);
      expect(accountId.value).toBe(idValue);
    });

    it('유효한 UUID v7 형식이어야 한다', () => {
      const idValue = '01912345-6789-7abc-9999-123456789def';

      const accountId = AccountId.from(idValue);

      expect(accountId.value).toBe(idValue);
    });
  });
});
