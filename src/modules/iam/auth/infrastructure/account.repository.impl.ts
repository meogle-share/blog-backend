import { IAccountRepository } from '@modules/iam/auth/domain/account.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { Account } from '@modules/iam/auth/domain/account.aggregate';
import { AccountMapper } from '@modules/iam/auth/infrastructure/account.mapper';

@Injectable()
export class AccountRepositoryImpl implements IAccountRepository {
  constructor(
    @InjectRepository(AccountModel)
    private readonly repository: Repository<AccountModel>,
    private readonly mapper: AccountMapper,
  ) {}

  async findOneByUsername(username: string): Promise<Account | null> {
    const model = await this.repository.findOneBy({ username });
    return model ? this.mapper.toDomain(model) : null;
  }
}
