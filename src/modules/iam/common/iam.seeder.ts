import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';

@Injectable()
export class IamSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(AccountModel) private accountRepo: Repository<AccountModel>,
    @InjectRepository(UserModel) private userRepo: Repository<UserModel>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  // todo: password hashing
  private async seedAdminUser() {
    const existingAccount = await this.accountRepo.findOne({
      where: { username: 'admin' },
    });

    if (existingAccount) {
      return;
    }

    const accountId = uuidv7();

    await this.accountRepo.save({
      id: accountId,
      username: 'admin',
      password: 'admin',
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
