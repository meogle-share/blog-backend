import { Entity, generateId } from '@libs/ddd';
import { AccountProvider } from './account-provider.vo';
import { ProviderId } from './provider-id.vo';

interface OAuthAccountProps {
  userId: string;
  provider: AccountProvider;
  providerAccountId: ProviderId;
  providerLogin: string;
}

interface CreateParams {
  userId: string;
  provider: AccountProvider;
  providerAccountId: ProviderId;
  providerLogin: string;
}

export class OAuthAccount extends Entity<OAuthAccountProps> {
  static create(params: CreateParams): OAuthAccount {
    return new OAuthAccount({
      id: generateId(),
      props: params,
    });
  }

  static from(data: { id: string; props: OAuthAccountProps }): OAuthAccount {
    return new OAuthAccount(data);
  }
}
