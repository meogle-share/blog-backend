import { Mapper } from '@libs/ddd';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { Injectable } from '@nestjs/common';
import { UserNickName } from '@modules/iam/user/domain/models/user-nickname.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

@Injectable()
export class UserMapper implements Mapper<User, UserModel> {
  toDomain(model: UserModel): User {
    return User.from({
      id: model.id,
      props: {
        nickname: UserNickName.from(model.nickname),
        email: model.email ? UserEmail.from(model.email) : null,
      },
    });
  }

  toModel(user: User): UserModel {
    const props = user.getProps();
    return UserModel.from({
      id: props.id,
      nickname: props.nickname.value,
      email: props.email?.value ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
