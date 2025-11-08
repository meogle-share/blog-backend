import { User } from './user.aggregate';
import { UserId } from './value-objects/user-id';

describe('User Aggregate', () => {
  describe('create', () => {
    it('유효한 파라미터로 User를 생성해야 한다', () => {
      const username = 'testuser';
      const password = 'password123';
      const nickname = 'Test Nickname';

      const user = User.create({
        username,
        password,
        nickname,
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.getProps().username).toBe(username);
      expect(user.getProps().password).toBe(password);
      expect(user.getProps().nickname).toBe(nickname);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 User를 재구성해야 한다', () => {
      const userId = UserId.from('01912345-6789-7abc-8555-123456789abc');
      const username = 'existinguser';
      const password = 'existingpassword';
      const nickname = 'Existing Nickname';

      const user = User.from({
        id: userId,
        props: {
          username,
          password,
          nickname,
        },
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userId);
      expect(user.getProps().username).toBe(username);
      expect(user.getProps().password).toBe(password);
      expect(user.getProps().nickname).toBe(nickname);
    });
  });
});