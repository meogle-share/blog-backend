import { AggregateRoot } from '@libs/ddd';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { UserName } from '@modules/iam/user/domain/value-objects/user-name';
import { UserNickName } from '@modules/iam/user/domain/value-objects/user-nickname';
import { UserPassword } from '@modules/iam/user/domain/value-objects/user-password';

interface CreateUserParams {
  username: UserName;
  password: UserPassword;
  nickname: UserNickName;
}

interface UserProps {
  username: UserName;
  password: UserPassword;
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
