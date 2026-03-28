import { Injectable } from '@nestjs/common';
import { Mapper } from '@libs/ddd';
import { Account } from '../domain/models/account.aggregate';
import { AccountModel } from './account.model';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { PasswordCredential } from '../domain/models/password-credential.entity';
import { AccountProvider } from '../domain/models/account-provider.vo';
import { ProviderId } from '../domain/models/provider-id.vo';
import { AccountHashedPassword } from '../domain/models/account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';
import { OAuthAccountModel } from './oauth-account.model';
import { PasswordCredentialModel } from './password-credential.model';

@Injectable()
export class AccountMapper implements Mapper<Account, AccountModel> {
  toDomain(model: AccountModel): Account {
    const oauthAccounts = (model.oauthAccounts ?? []).map((oa) =>
      OAuthAccount.from({
        id: oa.id,
        props: {
          provider: AccountProvider.from(oa.provider),
          providerAccountId: ProviderId.from(oa.providerAccountId),
          providerLogin: oa.providerLogin,
        },
      }),
    );

    const credentialModel = model.passwordCredentials?.[0] ?? null;
    const passwordCredential = credentialModel
      ? PasswordCredential.from({
          id: credentialModel.id,
          props: {
            email: UserEmail.from(credentialModel.email),
            hashedPassword: AccountHashedPassword.from(credentialModel.hashedPassword),
          },
        })
      : null;

    return Account.from({
      id: model.id,
      props: {
        oauthAccounts,
        passwordCredential,
      },
    });
  }

  toModel(domain: Account): AccountModel {
    const props = domain.getProps();

    const oauthModels = props.oauthAccounts.map((oa) => {
      const oaProps = oa.getProps();
      return OAuthAccountModel.from({
        id: oaProps.id,
        accountId: props.id,
        provider: oaProps.provider.value,
        providerAccountId: oaProps.providerAccountId.value,
        providerLogin: oaProps.providerLogin,
        createdAt: oaProps.createdAt,
        updatedAt: oaProps.updatedAt,
      });
    });

    const credentialModels: PasswordCredentialModel[] = [];
    if (props.passwordCredential) {
      const pcProps = props.passwordCredential.getProps();
      credentialModels.push(
        PasswordCredentialModel.from({
          id: pcProps.id,
          accountId: props.id,
          email: pcProps.email.value,
          hashedPassword: pcProps.hashedPassword.value,
          createdAt: pcProps.createdAt,
          updatedAt: pcProps.updatedAt,
        }),
      );
    }

    return AccountModel.from({
      id: props.id,
      oauthAccounts: oauthModels,
      passwordCredentials: credentialModels,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}
