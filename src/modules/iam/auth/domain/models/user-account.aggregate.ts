import { AggregateRoot, generateId } from '@libs/ddd';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { AccountUsername } from './account-username.vo';

interface AccountProps {
  username: AccountUsername;
  password: AccountHashedPassword;
}

export class UserAccount extends AggregateRoot<AccountProps> {
  static create(params: AccountProps): UserAccount {
    return new UserAccount({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: AccountProps }): UserAccount {
    return new UserAccount(data);
  }
}
