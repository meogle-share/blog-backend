import { Account } from '@modules/iam/auth/domain/account.aggregate';

export const ACCOUNT_REPOSITORY = Symbol('IAccountRepository');
export interface IAccountRepository {
  findOneByUsername(username: string): Promise<Account | null>;
}
