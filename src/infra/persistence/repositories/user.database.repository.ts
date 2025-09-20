import { IUserRepository } from '../../../application/ports/user.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../typeorm/entities/user.entity';
import type { Relation } from 'typeorm';
import { User } from '../../../domain/models/user';

export class UserDatabaseRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Relation<UserEntity>,
  ) {}

  async findById(id: number): Promise<User> {
    return new User('dummy', 'pwd');
  }
}
