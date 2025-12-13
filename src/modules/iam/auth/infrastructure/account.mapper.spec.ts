import { AccountMapper } from './account.mapper';
import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id';
import { AccountUsername } from '@modules/iam/auth/domain/value-objects/account-username';
import { AccountHashedPassword } from '@modules/iam/auth/domain/value-objects/account-hashed-password.vo';

describe('AccountMapper', () => {
  let mapper: AccountMapper;

  const TEST_UUID_V7 = '01912345-6789-7abc-8def-0123456789ab';

  beforeEach(() => {
    mapper = new AccountMapper();
  });

  describe('toDomain', () => {
    it('AccountModel을 Account 도메인 객체로 변환한다', () => {
      const model = AccountModel.from({
        id: TEST_UUID_V7,
        username: 'test@example.com',
        password: 'password123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      const domain = mapper.toDomain(model);

      expect(domain).toBeInstanceOf(Account);
      expect(domain.id.value).toBe(model.id);
      expect(domain.getProps().username.value).toBe(model.username);
      expect(domain.getProps().password.value).toBe(model.password);
    });
  });

  describe('toModel', () => {
    it('Account 도메인 객체를 AccountModel로 변환한다', () => {
      const id = AccountId.from(TEST_UUID_V7);
      const username = AccountUsername.from('test@example.com');
      const password = AccountHashedPassword.from('password123');

      const domain = Account.from({
        id,
        props: { username, password },
      });

      const model = mapper.toModel(domain);

      expect(model).toBeInstanceOf(AccountModel);
      expect(model.id).toBe(id.value);
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
