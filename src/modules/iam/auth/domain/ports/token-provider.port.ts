import { UserAccount } from '../models/user-account.aggregate';

export type AccountType = 'user' | 'system';

export interface TokenInfo {
  username: string;
  accountType: AccountType;
  expiresAt: Date;
}

export interface TokenProvider {
  generate(account: UserAccount): string;
  verify(token: string): TokenInfo | null;
}
