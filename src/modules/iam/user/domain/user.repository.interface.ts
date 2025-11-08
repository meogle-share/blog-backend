import { User } from '@modules/iam/user/domain/user.aggregate';

export const USER_REPOSITORY = Symbol('IUserRepository');
export interface IUserRepository {
  save(user: User): Promise<User>;
}
