import { UserMapper } from './user.mapper';
import { UserModel } from './user.model';
import { User } from '../domain/models/user.aggregate';
import { UserNickName } from '../domain/models/user-nickname.vo';
import { UserEmail } from '../domain/models/user-email.vo';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toDomain', () => {
    it('UserModel을 User 도메인 객체로 변환해야 한다', () => {
      const userModel: UserModel = {
        id: '01912345-6789-7abc-8000-123456789abc',
        nickname: 'TestUser',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = mapper.toDomain(userModel);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userModel.id);
      expect(user.getProps().nickname).toBeInstanceOf(UserNickName);
      expect(user.getProps().nickname.value).toBe(userModel.nickname);
      expect(user.getProps().email).toBeInstanceOf(UserEmail);
      expect(user.getProps().email!.value).toBe(userModel.email);
    });

    it('email이 null인 UserModel을 변환해야 한다', () => {
      const userModel: UserModel = {
        id: '01912345-6789-7abc-8000-123456789abc',
        nickname: 'TestUser',
        email: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = mapper.toDomain(userModel);

      expect(user.getProps().email).toBeNull();
    });
  });

  describe('toModel', () => {
    it('User 도메인 객체를 UserModel로 변환해야 한다', () => {
      const user = User.from({
        id: '01912345-6789-7abc-8222-123456789abc',
        props: {
          nickname: UserNickName.from('TestUser'),
          email: UserEmail.from('test@example.com'),
        },
      });

      const userModel = mapper.toModel(user);

      expect(userModel.id).toBe('01912345-6789-7abc-8222-123456789abc');
      expect(userModel.nickname).toBe('TestUser');
      expect(userModel.email).toBe('test@example.com');
    });

    it('email이 null인 User를 변환해야 한다', () => {
      const user = User.from({
        id: '01912345-6789-7abc-8222-123456789abc',
        props: {
          nickname: UserNickName.from('TestUser'),
          email: null,
        },
      });

      const userModel = mapper.toModel(user);

      expect(userModel.email).toBeNull();
    });
  });

  describe('양방향 변환', () => {
    it('toModel 후 toDomain으로 변환하면 동일한 데이터를 가져야 한다', () => {
      const originalUser = User.create({
        nickname: UserNickName.from('RoundTripUser'),
        email: UserEmail.from('roundtrip@example.com'),
      });

      const userModel = mapper.toModel(originalUser);
      const reconstructedUser = mapper.toDomain(userModel);

      expect(reconstructedUser.id).toBe(originalUser.id);
      expect(reconstructedUser.getProps().nickname.value).toBe(
        originalUser.getProps().nickname.value,
      );
      expect(reconstructedUser.getProps().email!.value).toBe(originalUser.getProps().email!.value);
    });
  });
});
