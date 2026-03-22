import { User } from '../models/user.aggregate';

export interface UserRepositoryPort {
  findOneById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
