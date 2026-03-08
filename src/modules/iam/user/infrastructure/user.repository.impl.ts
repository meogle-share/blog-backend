import { UserRepositoryPort } from '../domain/ports/user.repository.port';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './user.model';
import { Repository } from 'typeorm';
import { User } from '../domain/models/user.aggregate';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserModel)
    private readonly repository: Repository<UserModel>,
    private readonly mapper: UserMapper,
  ) {}

  async save(user: User): Promise<User> {
    const model = await this.repository.save(this.mapper.toModel(user));
    return this.mapper.toDomain(model);
  }
}
