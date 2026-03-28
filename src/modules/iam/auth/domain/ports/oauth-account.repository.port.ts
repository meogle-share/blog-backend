import { OAuthAccount } from '../models/oauth-account.entity';
import { Provider } from '@modules/iam/auth/domain/models/account-provider.vo';

export interface OAuthAccountRepositoryPort {
  findOneByProviderAndId(
    provider: Provider,
    providerAccountId: string,
  ): Promise<OAuthAccount | null>;
  save(account: OAuthAccount): Promise<OAuthAccount>;
}
