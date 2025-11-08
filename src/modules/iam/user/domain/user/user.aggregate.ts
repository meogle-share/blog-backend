import { AggregateRoot } from '@libs/ddd';
import { UserId } from '@modules/iam/user/domain/user/user-id';

interface CreateUserParams {
  username: string;
  password: string;
  nickname: string;
}

interface UserProps {
  username: string;
  password: string;
  nickname: string;
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
