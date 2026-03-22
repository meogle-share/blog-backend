import { PasswordCredential } from './password-credential.entity';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';
import { generateId } from '@libs/ddd';

describe('PasswordCredential Entity', () => {
  describe('create', () => {
    it('유효한 파라미터로 PasswordCredential을 생성해야 한다', () => {
      const userId = generateId();
      const email = UserEmail.from('test@example.com');
      const hashedPassword = AccountHashedPassword.from('hashed123');

      const credential = PasswordCredential.create({ userId, email, hashedPassword });

      expect(credential).toBeInstanceOf(PasswordCredential);
      expect(typeof credential.id).toBe('string');
      expect(credential.getProps().userId).toBe(userId);
      expect(credential.getProps().email).toBe(email);
      expect(credential.getProps().hashedPassword).toBe(hashedPassword);
    });
  });

  describe('from', () => {
    it('기존 데이터로부터 PasswordCredential을 재구성해야 한다', () => {
      const id = '01912345-6789-7abc-8555-123456789abc';
      const userId = generateId();
      const email = UserEmail.from('existing@example.com');
      const hashedPassword = AccountHashedPassword.from('existingHash');

      const credential = PasswordCredential.from({
        id,
        props: { userId, email, hashedPassword },
      });

      expect(credential.id).toBe(id);
      expect(credential.getProps().userId).toBe(userId);
      expect(credential.getProps().email.value).toBe('existing@example.com');
    });
  });
});
