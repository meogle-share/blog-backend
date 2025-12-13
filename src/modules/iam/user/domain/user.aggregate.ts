import { AggregateRoot } from '@libs/ddd';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { UserNickName } from '@modules/iam/user/domain/value-objects/user-nickname';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id.vo';

interface CreateUserParams {
  accountId: AccountId;
  nickname: UserNickName;
}

interface UserProps {
  accountId: AccountId;
  nickname: UserNickName;
}

export class User extends AggregateRoot<UserProps> {
  static create(params: CreateUserParams): User {
    return new User({
      id: UserId.generate(),
      props: params,
    });
  }

  static from(data: { id: UserId; props: UserProps }): User {
    return new User({
      id: data.id,
      props: data.props,
    });
  }
}
