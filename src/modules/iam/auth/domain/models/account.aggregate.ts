import { AggregateRoot, generateId } from '@libs/ddd';
import { OAuthAccount } from './oauth-account.entity';
import { PasswordCredential } from './password-credential.entity';
import { AccountProvider } from './account-provider.vo';
import { ProviderId } from './provider-id.vo';
import { AccountHashedPassword } from './account-hashed-password.vo';
import { UserEmail } from '@modules/iam/user/domain/models/user-email.vo';

interface AccountProps {
  oauthAccounts: OAuthAccount[];
  passwordCredential: PasswordCredential | null;
}

interface CreateWithOAuthParams {
  provider: AccountProvider;
  providerAccountId: ProviderId;
  providerLogin: string;
}

interface CreateWithPasswordParams {
  email: UserEmail;
  hashedPassword: AccountHashedPassword;
}

export class Account extends AggregateRoot<AccountProps> {
  static createWithOAuth(params: CreateWithOAuthParams): Account {
    const oauthAccount = OAuthAccount.create({
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      providerLogin: params.providerLogin,
    });

    return new Account({
      id: generateId(),
      props: {
        oauthAccounts: [oauthAccount],
        passwordCredential: null,
      },
    });
  }

  static createWithPassword(params: CreateWithPasswordParams): Account {
    const credential = PasswordCredential.create({
      email: params.email,
      hashedPassword: params.hashedPassword,
    });

    return new Account({
      id: generateId(),
      props: {
        oauthAccounts: [],
        passwordCredential: credential,
      },
    });
  }

  static from(data: { id: string; props: AccountProps }): Account {
    return new Account(data);
  }
}
