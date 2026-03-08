import { AccountRepositoryPort } from '../domain/ports/account.repository.port';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountModel } from './account.model';
import { UserAccount } from '../domain/models/user-account.aggregate';
import { AccountMapper } from './account.mapper';

@Injectable()
export class AccountRepositoryImpl implements AccountRepositoryPort {
  constructor(
    @InjectRepository(AccountModel)
    private readonly repository: Repository<AccountModel>,
    private readonly mapper: AccountMapper,
  ) {}

  async findOneByUsername(username: string): Promise<UserAccount | null> {
    const model = await this.repository.findOneBy({ username });
    return model ? this.mapper.toDomain(model) : null;
  }
}
