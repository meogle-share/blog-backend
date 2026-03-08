import { User } from '../models/user.aggregate';

export interface UserRepositoryPort {
  save(user: User): Promise<User>;
}
