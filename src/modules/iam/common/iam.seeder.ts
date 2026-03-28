import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import type { PasswordHasher } from '@modules/iam/auth/domain/ports/password-hasher.port';

@Injectable()
export class IamSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(AccountModel)
    private readonly accountRepo: Repository<AccountModel>,
    @InjectRepository(PasswordCredentialModel)
    private readonly credentialRepo: Repository<PasswordCredentialModel>,
    @InjectRepository(UserModel) private readonly userRepo: Repository<UserModel>,
    @Inject(PASSWORD_HASHER) private readonly passwordHashService: PasswordHasher,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const existingCredential = await this.credentialRepo.findOne({
      where: { email: 'admin@admin.com' },
    });

    if (existingCredential) {
      return;
    }

    const accountId = uuidv7();
    const hashedPassword = await this.passwordHashService.hash('admin12345');
    const now = new Date();

    await this.accountRepo.save({
      id: accountId,
      createdAt: now,
      updatedAt: now,
    });

    await this.credentialRepo.save({
      id: uuidv7(),
      accountId,
      email: 'admin@admin.com',
      hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    await this.userRepo.save({
      id: uuidv7(),
      accountId,
      nickname: 'admin',
      email: 'admin@admin.com',
      createdAt: now,
      updatedAt: now,
    });
  }
}
