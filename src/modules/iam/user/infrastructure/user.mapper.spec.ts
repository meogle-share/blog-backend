import { UserMapper } from './user.mapper';
import { UserModel } from './user.model';
import { User } from '../domain/user.aggregate';
import { UserId } from '../domain/value-objects/user-id.vo';
import { AccountId } from '../../auth/domain/value-objects/account-id.vo';
import { UserNickName } from '../domain/value-objects/user-nickname.vo';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toDomain', () => {
    it('UserModel을 User 도메인 객체로 변환해야 한다', () => {
      const userModel: UserModel = {
        id: '01912345-6789-7abc-8000-123456789abc',
        accountId: '01912345-6789-7abc-8001-123456789abc',
        nickname: 'TestUser',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = mapper.toDomain(userModel);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.id.value).toBe(userModel.id);
      expect(user.getProps().accountId).toBeInstanceOf(AccountId);
      expect(user.getProps().accountId.value).toBe(userModel.accountId);
      expect(user.getProps().nickname).toBeInstanceOf(UserNickName);
      expect(user.getProps().nickname.value).toBe(userModel.nickname);
    });
  });

  describe('toModel', () => {
    it('User 도메인 객체를 UserModel로 변환해야 한다', () => {
      const user = User.from({
        id: UserId.from('01912345-6789-7abc-8222-123456789abc'),
        props: {
          accountId: AccountId.from('01912345-6789-7abc-8223-123456789abc'),
          nickname: UserNickName.from('TestUser'),
        },
      });

      const userModel = mapper.toModel(user);

      expect(userModel).toHaveProperty('id');
      expect(userModel).toHaveProperty('accountId');
      expect(userModel).toHaveProperty('nickname');
      expect(userModel).toHaveProperty('createdAt');
      expect(userModel).toHaveProperty('updatedAt');

      expect(userModel.id).toBe('01912345-6789-7abc-8222-123456789abc');
      expect(userModel.accountId).toBe('01912345-6789-7abc-8223-123456789abc');
      expect(userModel.nickname).toBe('TestUser');
    });
  });

  describe('양방향 변환', () => {
    it('toModel 후 toDomain으로 변환하면 동일한 데이터를 가져야 한다', () => {
      const originalUser = User.create({
        accountId: AccountId.from('01912345-6789-7abc-8225-123456789abc'),
        nickname: UserNickName.from('RoundTripUser'),
      });

      const userModel = mapper.toModel(originalUser);
      const reconstructedUser = mapper.toDomain(userModel);

      expect(reconstructedUser.id.value).toBe(originalUser.id.value);
      expect(reconstructedUser.getProps().accountId.value).toBe(
        originalUser.getProps().accountId.value,
      );
      expect(reconstructedUser.getProps().nickname.value).toBe(
        originalUser.getProps().nickname.value,
      );
    });
  });
});
