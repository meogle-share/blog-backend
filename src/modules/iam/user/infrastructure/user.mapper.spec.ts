import { UserMapper } from './user.mapper';
import { UserModel } from './user.model';
import { User } from '../domain/user.aggregate';
import { UserId } from '../domain/value-objects/user-id';
import { UserName } from '../domain/value-objects/user-name';
import { UserPassword } from '../domain/value-objects/user-password';
import { UserNickName } from '../domain/value-objects/user-nickname';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(() => {
    mapper = new UserMapper();
  });

  describe('toDomain', () => {
    it('UserModel을 User 도메인 객체로 변환해야 한다', () => {
      const userModel: UserModel = {
        id: '01912345-6789-7abc-8000-123456789abc',
        username: 'test@example.com',
        password: 'hashedPassword123',
        nickname: 'TestUser',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = mapper.toDomain(userModel);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.id.value).toBe(userModel.id);
      expect(user.getProps().username).toBeInstanceOf(UserName);
      expect(user.getProps().username.value).toBe(userModel.username);
      expect(user.getProps().password).toBeInstanceOf(UserPassword);
      expect(user.getProps().password.value).toBe(userModel.password);
      expect(user.getProps().nickname).toBeInstanceOf(UserNickName);
      expect(user.getProps().nickname.value).toBe(userModel.nickname);
    });

    it('trim된 값으로 Value Object를 생성해야 한다', () => {
      const userModel: UserModel = {
        id: '01912345-6789-7abc-8111-123456789abc',
        username: '  test@example.com  ',
        password: 'hashedPassword123',
        nickname: '  TestUser  ',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const user = mapper.toDomain(userModel);

      expect(user.getProps().username.value).toBe('test@example.com');
      expect(user.getProps().nickname.value).toBe('TestUser');
    });
  });

  describe('toModel', () => {
    it('User 도메인 객체를 UserModel로 변환해야 한다', () => {
      const user = User.from({
        id: UserId.from('01912345-6789-7abc-8222-123456789abc'),
        props: {
          username: UserName.from('test@example.com'),
          password: UserPassword.from('hashedPassword123'),
          nickname: UserNickName.from('TestUser'),
        },
      });

      const userModel = mapper.toModel(user);

      expect(userModel).toHaveProperty('id');
      expect(userModel).toHaveProperty('username');
      expect(userModel).toHaveProperty('password');
      expect(userModel).toHaveProperty('nickname');
      expect(userModel).toHaveProperty('createdAt');
      expect(userModel).toHaveProperty('updatedAt');

      expect(userModel.id).toBe('01912345-6789-7abc-8222-123456789abc');
      expect(userModel.username).toBe('test@example.com');
      expect(userModel.password).toBe('hashedPassword123');
      expect(userModel.nickname).toBe('TestUser');
    });

    it('Value Object의 값을 원시 타입으로 변환해야 한다', () => {
      const user = User.create({
        username: UserName.from('another@example.com'),
        password: UserPassword.from('anotherPassword456'),
        nickname: UserNickName.from('AnotherUser'),
      });

      const userModel = mapper.toModel(user);

      expect(typeof userModel.id).toBe('string');
      expect(typeof userModel.username).toBe('string');
      expect(typeof userModel.password).toBe('string');
      expect(typeof userModel.nickname).toBe('string');
      expect(userModel.createdAt).toBeInstanceOf(Date);
      expect(userModel.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('양방향 변환', () => {
    it('toModel 후 toDomain으로 변환하면 동일한 데이터를 가져야 한다', () => {
      const originalUser = User.create({
        username: UserName.from('roundtrip@example.com'),
        password: UserPassword.from('roundTripPassword789'),
        nickname: UserNickName.from('RoundTripUser'),
      });

      const userModel = mapper.toModel(originalUser);
      const reconstructedUser = mapper.toDomain(userModel);

      expect(reconstructedUser.id.value).toBe(originalUser.id.value);
      expect(reconstructedUser.getProps().username.value).toBe(
        originalUser.getProps().username.value,
      );
      expect(reconstructedUser.getProps().password.value).toBe(
        originalUser.getProps().password.value,
      );
      expect(reconstructedUser.getProps().nickname.value).toBe(
        originalUser.getProps().nickname.value,
      );
    });
  });
});