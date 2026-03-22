import { User } from './user.aggregate';
import { UserNickName } from './user-nickname.vo';
import { UserEmail } from './user-email.vo';

describe('User Aggregate', () => {
  describe('create', () => {
    it('이메일이 있는 User를 생성해야 한다', () => {
      const nickname = UserNickName.from('테스트닉네임');
      const email = UserEmail.from('test@example.com');

      const user = User.create({ nickname, email });

      expect(user).toBeInstanceOf(User);
      expect(typeof user.id).toBe('string');
      expect(user.getProps().nickname).toBe(nickname);
      expect(user.getProps().email).toBe(email);
    });

    it('이메일이 null인 User를 생성해야 한다', () => {
      const nickname = UserNickName.from('테스트닉네임');

      const user = User.create({ nickname, email: null });

      expect(user.getProps().email).toBeNull();
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 User를 재구성해야 한다', () => {
      const userId = '01912345-6789-7abc-8555-123456789abc';
      const nickname = UserNickName.from('기존닉네임');
      const email = UserEmail.from('existing@example.com');

      const user = User.from({
        id: userId,
        props: { nickname, email },
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userId);
      expect(user.getProps().nickname).toBe(nickname);
      expect(user.getProps().email).toBe(email);
    });
  });
});
