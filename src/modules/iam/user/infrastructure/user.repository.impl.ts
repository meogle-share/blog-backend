import { IUserRepository } from '@modules/iam/user/domain/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { Repository } from 'typeorm';
import { User } from '@modules/iam/user/domain/user.aggregate';
import { UserMapper } from '@modules/iam/user/infrastructure/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
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
