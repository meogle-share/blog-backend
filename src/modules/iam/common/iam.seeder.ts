import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import {
  PASSWORD_HASH_SERVICE,
  type IPasswordHashService,
} from '@modules/iam/auth/domain/password-hash.service.interface';

@Injectable()
export class IamSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(AccountModel) private readonly accountRepo: Repository<AccountModel>,
    @InjectRepository(UserModel) private readonly userRepo: Repository<UserModel>,
    @Inject(PASSWORD_HASH_SERVICE) private readonly passwordHashService: IPasswordHashService,
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
