import { Mapper } from '@libs/ddd';
import { User } from '@modules/iam/user/domain/user.aggregate';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { Injectable } from '@nestjs/common';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { UserName } from '@modules/iam/user/domain/value-objects/user-name';
import { UserPassword } from '@modules/iam/user/domain/value-objects/user-password';
import { UserNickName } from '@modules/iam/user/domain/value-objects/user-nickname';

@Injectable()
export class UserMapper implements Mapper<User, UserModel> {
  toDomain(model: UserModel): User {
    return User.from({
      id: UserId.from(model.id),
      props: {
        username: UserName.from(model.username),
        password: UserPassword.from(model.password),
        nickname: UserNickName.from(model.nickname),
      },
    });
  }

  toModel(user: User): UserModel {
    const props = user.getProps();
    return UserModel.from({
      id: props.id.value,
      username: props.username.value,
      password: props.password.value,
      nickname: props.nickname.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
