import { User } from '@modules/iam/user/domain/models/user.aggregate';

export type AccountType = 'user' | 'system';

export interface TokenInfo {
  email: string | null;
  accountType: AccountType;
  expiresAt: Date;
}

export interface TokenProvider {
  generate(user: User): string;
  verify(token: string): TokenInfo | null;
}
