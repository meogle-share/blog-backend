import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordCredentialRepositoryPort } from '../domain/ports/password-credential.repository.port';
import { PasswordCredential } from '../domain/models/password-credential.entity';
import { PasswordCredentialModel } from './password-credential.model';
import { PasswordCredentialMapper } from './password-credential.mapper';

@Injectable()
export class PasswordCredentialRepository implements PasswordCredentialRepositoryPort {
  constructor(
    @InjectRepository(PasswordCredentialModel)
    private readonly repository: Repository<PasswordCredentialModel>,
    private readonly mapper: PasswordCredentialMapper,
  ) {}

  async findOneByEmail(email: string): Promise<PasswordCredential | null> {
    const model = await this.repository.findOneBy({ email });
    return model ? this.mapper.toDomain(model) : null;
  }

  async save(credential: PasswordCredential): Promise<PasswordCredential> {
    const model = this.mapper.toModel(credential);
    const saved = await this.repository.save(model);
    return this.mapper.toDomain(saved);
  }
}
