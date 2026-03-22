import { Entity, generateId } from '@libs/ddd';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

interface PasswordCredentialProps {
  userId: string;
  email: UserEmail;
  hashedPassword: AccountHashedPassword;
}

interface CreateParams {
  userId: string;
  email: UserEmail;
  hashedPassword: AccountHashedPassword;
}

export class PasswordCredential extends Entity<PasswordCredentialProps> {
  static create(params: CreateParams): PasswordCredential {
    return new PasswordCredential({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: PasswordCredentialProps }): PasswordCredential {
    return new PasswordCredential(data);
  }
}
