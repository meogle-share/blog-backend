import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import type { PasswordHasher } from '@modules/iam/auth/domain/ports/password-hasher.port';

@Injectable()
export class IamSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(AccountModel) private readonly accountRepo: Repository<AccountModel>,
    @InjectRepository(UserModel) private readonly userRepo: Repository<UserModel>,
    @Inject(PASSWORD_HASHER) private readonly passwordHashService: PasswordHasher,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const existingAccount = await this.accountRepo.findOne({
      where: { username: 'admin@admin.com' },
    });

    if (existingAccount) {
      return;
    }

    const accountId = uuidv7();
    const hashedPassword = await this.passwordHashService.hash('admin12345');

    await this.accountRepo.save({
      id: accountId,
      username: 'admin@admin.com',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepo.save({
      id: uuidv7(),
      accountId: accountId,
      nickname: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
