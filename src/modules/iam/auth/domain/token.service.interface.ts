import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { TokenInfo } from '../../../../types/token.interface';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface ITokenService {
  generate(account: Account): string;
  verify(token: string): TokenInfo | null;
}
