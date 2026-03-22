import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd';
import { PasswordCredential } from '../domain/models/password-credential.entity';
import { PasswordCredentialModel } from './password-credential.model';
import { AccountHashedPassword } from '../domain/models/account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

@Injectable()
export class PasswordCredentialMapper
  implements Mapper<PasswordCredential, PasswordCredentialModel>
{
  toDomain(model: PasswordCredentialModel): PasswordCredential {
    return PasswordCredential.from({
      id: model.id,
      props: {
        userId: model.userId,
        email: UserEmail.from(model.email),
        hashedPassword: AccountHashedPassword.from(model.hashedPassword),
      },
    });
  }

  toModel(domain: PasswordCredential): PasswordCredentialModel {
    const props = domain.getProps();
    return PasswordCredentialModel.from({
      id: props.id,
      userId: props.userId,
      email: props.email.value,
      hashedPassword: props.hashedPassword.value,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
