import { User } from '../../domain/models/user';

export const USER_REPOSITORY = Symbol('IUserRepository');
export interface IUserRepository {
  findById(id: number): Promise<User | null>;
}
