import { User } from './user.aggregate';
import { UserId } from './value-objects/user-id.vo';
import { UserNickName } from './value-objects/user-nickname.vo';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id.vo';

describe('User Aggregate', () => {
  describe('create', () => {
    it('유효한 파라미터로 User를 생성해야 한다', () => {
      const accountId = AccountId.generate();
      const nickname = UserNickName.from('테스트닉네임');

      const user = User.create({
        accountId,
        nickname,
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.getProps().accountId).toBe(accountId);
      expect(user.getProps().nickname).toBe(nickname);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 User를 재구성해야 한다', () => {
      const userId = UserId.from('01912345-6789-7abc-8555-123456789abc');
      const accountId = AccountId.generate();
      const nickname = UserNickName.from('기존닉네임');

      const user = User.from({
        id: userId,
        props: {
          accountId,
          nickname,
        },
      });

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userId);
      expect(user.getProps().accountId).toBe(accountId);
      expect(user.getProps().nickname).toBe(nickname);
    });
  });
});
