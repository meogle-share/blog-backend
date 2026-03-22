import { OAuthAccount } from '../models/oauth-account.entity';

export interface OAuthAccountRepositoryPort {
  findOneByProviderAndId(provider: string, providerAccountId: string): Promise<OAuthAccount | null>;
  save(account: OAuthAccount): Promise<OAuthAccount>;
}
