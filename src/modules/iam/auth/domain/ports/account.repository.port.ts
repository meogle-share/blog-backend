import { UserAccount } from '../models/user-account.aggregate';

export interface AccountRepositoryPort {
  findOneByUsername(username: string): Promise<UserAccount | null>;
}
