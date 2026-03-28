import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRepositoryPort } from '../domain/ports/account.repository.port';
import { Account } from '../domain/models/account.aggregate';
import { AccountModel } from './account.model';
import { AccountMapper } from './account.mapper';

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(
    @InjectRepository(AccountModel)
    private readonly repository: Repository<AccountModel>,
    private readonly mapper: AccountMapper,
  ) {}

  async findOneById(id: string): Promise<Account | null> {
    const model = await this.repository.findOneBy({ id });
    return model ? this.mapper.toDomain(model) : null;
  }

  async findOneByProviderAndProviderId(
    provider: string,
    providerAccountId: string,
  ): Promise<Account | null> {
    const model = await this.repository.findOne({
      where: { oauthAccounts: { provider, providerAccountId } },
    });
    return model ? this.mapper.toDomain(model) : null;
  }

  async findOneByEmail(email: string): Promise<Account | null> {
    const model = await this.repository.findOne({
      where: { passwordCredentials: { email } },
    });
    return model ? this.mapper.toDomain(model) : null;
  }

  async save(account: Account): Promise<Account> {
    const model = this.mapper.toModel(account);
    const saved = await this.repository.save(model);
    return this.mapper.toDomain(saved);
  }
}
