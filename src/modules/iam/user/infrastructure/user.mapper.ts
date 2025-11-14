import { Mapper } from '@libs/ddd';
import { User } from '@modules/iam/user/domain/user.aggregate';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { Injectable } from '@nestjs/common';
import { UserId } from '@modules/iam/user/domain/value-objects/user-id';
import { UserNickName } from '@modules/iam/user/domain/value-objects/user-nickname';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id';

@Injectable()
export class UserMapper implements Mapper<User, UserModel> {
  toDomain(model: UserModel): User {
    return User.from({
      id: UserId.from(model.id),
      props: {
        accountId: AccountId.from(model.accountId),
        nickname: UserNickName.from(model.nickname),
      },
    });
  }

  toModel(user: User): UserModel {
    const props = user.getProps();
    return UserModel.from({
      id: props.id.value,
      accountId: props.accountId.value,
      nickname: props.nickname.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
