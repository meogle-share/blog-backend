import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd';
import { UserAccount } from '../domain/models/user-account.aggregate';
import { AccountModel } from './account.model';
import { AccountUsername } from '../domain/models/account-username.vo';
import { AccountHashedPassword } from '../domain/models/account-hashed-password.vo';

@Injectable()
export class AccountMapper implements Mapper<UserAccount, AccountModel> {
  toDomain(model: AccountModel): UserAccount {
    return UserAccount.from({
      id: model.id,
      props: {
        username: AccountUsername.from(model.username),
        password: AccountHashedPassword.from(model.password),
      },
    });
  }

  toModel(domain: UserAccount): AccountModel {
    const props = domain.getProps();
    return AccountModel.from({
      id: props.id,
      username: props.username.value,
      password: props.password.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
