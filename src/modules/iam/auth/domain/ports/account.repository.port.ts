import { Account } from '../models/account.aggregate';

export interface AccountRepositoryPort {
  findOneById(id: string): Promise<Account | null>;
  findOneByProviderAndProviderId(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null>;
  findOneByEmail(email: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
}
