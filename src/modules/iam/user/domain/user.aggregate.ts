import { AggregateRoot, generateId } from '@libs/ddd';
import { UserNickName } from '@modules/iam/user/domain/value-objects/user-nickname.vo';

interface CreateUserParams {
  accountId: string;
  nickname: UserNickName;
}

interface UserProps {
  accountId: string;
  nickname: UserNickName;
}

export class User extends AggregateRoot<UserProps> {
  static create(params: CreateUserParams): User {
    return new User({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: UserProps }): User {
    return new User({
      id: data.id,
      props: data.props,
    });
  }
}
