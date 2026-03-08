import { AccountMapper } from './account.mapper';
import { UserAccount } from '../domain/models/user-account.aggregate';
import { AccountModel } from './account.model';
import { AccountUsername } from '../domain/models/account-username.vo';
import { AccountHashedPassword } from '../domain/models/account-hashed-password.vo';

describe('AccountMapper', () => {
  let mapper: AccountMapper;

  const TEST_UUID_V7 = '01912345-6789-7abc-8def-0123456789ab';

  beforeEach(() => {
    mapper = new AccountMapper();
  });

  describe('toDomain', () => {
    it('AccountModel을 UserAccount 도메인 객체로 변환한다', () => {
      const model = AccountModel.from({
        id: TEST_UUID_V7,
        username: 'test@example.com',
        password: 'password123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const domain = mapper.toDomain(model);

      expect(domain).toBeInstanceOf(UserAccount);
      expect(domain.id).toBe(model.id);
      expect(domain.getProps().username.value).toBe(model.username);
      expect(domain.getProps().password.value).toBe(model.password);
    });
  });

  describe('toModel', () => {
    it('UserAccount 도메인 객체를 AccountModel로 변환한다', () => {
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const domain = UserAccount.from({
        id: TEST_UUID_V7,
        props: { username, password },
      });

      const model = mapper.toModel(domain);

      expect(model).toBeInstanceOf(AccountModel);
      expect(model.id).toBe(TEST_UUID_V7);
      expect(model.username).toBe(username.value);
      expect(model.password).toBe(password.value);
      expect(model.createdAt).toBeInstanceOf(Date);
      expect(model.updatedAt).toBeInstanceOf(Date);
    });

    it('왕복 변환 시 모든 속성이 보존된다', () => {
      const originalModel = AccountModel.from({
        id: TEST_UUID_V7,
        username: 'roundtrip@example.com',
        password: 'securepass123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const domain = mapper.toDomain(originalModel);
      const resultModel = mapper.toModel(domain);

      expect(resultModel.id).toBe(originalModel.id);
      expect(resultModel.username).toBe(originalModel.username);
      expect(resultModel.password).toBe(originalModel.password);
    });
  });
});
