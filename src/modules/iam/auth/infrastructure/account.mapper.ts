import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd';
import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { AccountId } from '@modules/iam/auth/domain/value-objects/account-id';
import { AccountUsername } from '@modules/iam/auth/domain/value-objects/account-username';
import { AccountPassword } from '@modules/iam/auth/domain/value-objects/account-password';

@Injectable()
export class AccountMapper implements Mapper<Account, AccountModel> {
  toDomain(model: AccountModel): Account {
    return Account.from({
      id: AccountId.from(model.id),
      props: {
        username: AccountUsername.from(model.username),
        password: AccountPassword.from(model.password),
      },
    });
  }

  toModel(domain: Account): AccountModel {
    const props = domain.getProps();
    return AccountModel.from({
      id: props.id.value,
      username: props.username.value,
      password: props.password.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
