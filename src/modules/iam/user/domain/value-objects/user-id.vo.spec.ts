import { UserId } from './user-id.vo';

describe('UserId', () => {
  describe('generate', () => {
    it('UUID 형식의 UserId를 생성해야 한다', () => {
      const userId = UserId.generate();

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('매번 다른 UUID를 생성해야 한다', () => {
      const userId1 = UserId.generate();
      const userId2 = UserId.generate();

      expect(userId1.value).not.toBe(userId2.value);
    });
  });

  describe('from', () => {
    it('주어진 문자열로 UserId를 생성해야 한다', () => {
      const idValue = '01912345-6789-7abc-8888-123456789abc';

      const userId = UserId.from(idValue);

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(idValue);
    });

    it('유효한 UUID v7 형식이어야 한다', () => {
      const idValue = '01912345-6789-7abc-9999-123456789def';

      const userId = UserId.from(idValue);

      expect(userId.value).toBe(idValue);
    });
  });
});
