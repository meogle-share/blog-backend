import { AggregateRoot, generateId } from '@libs/ddd';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { SystemUsername } from './system-username.vo';

interface AccountProps {
  username: SystemUsername;
  password: AccountHashedPassword;
}

export class SystemAccount extends AggregateRoot<AccountProps> {
  static create(params: AccountProps): SystemAccount {
    return new SystemAccount({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: AccountProps }): SystemAccount {
    return new SystemAccount(data);
  }
}
