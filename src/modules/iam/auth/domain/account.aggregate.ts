import { AggregateRoot } from '@libs/ddd';
import { AccountUsername } from '@modules/iam/auth/domain/value-objects/account-username.vo';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id.vo';
import { AccountHashedPassword } from '@modules/iam/auth/domain/value-objects/account-hashed-password.vo';

interface CreateAccountParams {
  username: AccountUsername;
  password: AccountHashedPassword;
}

interface AccountProps {
  username: AccountUsername;
  password: AccountHashedPassword;
}

export class Account extends AggregateRoot<AccountProps> {
  static create(params: CreateAccountParams): Account {
    return new Account({
      id: AccountId.generate(),
      props: params,
    });
  }

  static from(data: { id: UserId; props: AccountProps }): Account {
    return new Account({
      id: data.id,
      props: data.props,
    });
  }
}
