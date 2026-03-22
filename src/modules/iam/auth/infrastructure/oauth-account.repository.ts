import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthAccountRepositoryPort } from '../domain/ports/oauth-account.repository.port';
import { OAuthAccount } from '../domain/models/oauth-account.entity';
import { OAuthAccountModel } from './oauth-account.model';
import { OAuthAccountMapper } from './oauth-account.mapper';

@Injectable()
export class OAuthAccountRepository implements OAuthAccountRepositoryPort {
  constructor(
    @InjectRepository(OAuthAccountModel)
    private readonly repository: Repository<OAuthAccountModel>,
    private readonly mapper: OAuthAccountMapper,
  ) {}

  async findOneByProviderAndId(
    provider: string,
    providerAccountId: string,
  ): Promise<OAuthAccount | null> {
    const model = await this.repository.findOneBy({ provider, providerAccountId });
    return model ? this.mapper.toDomain(model) : null;
  }

  async save(account: OAuthAccount): Promise<OAuthAccount> {
    const model = this.mapper.toModel(account);
    const saved = await this.repository.save(model);
    return this.mapper.toDomain(saved);
  }
}
