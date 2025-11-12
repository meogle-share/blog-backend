import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(@InjectRepository(UserModel) private repo: Repository<UserModel>) {}

  async onModuleInit() {
    await this.seed();
  }

  // todo: password hashing
  private readonly adminSeed = {
    id: uuidv7(),
    username: 'admin',
    password: 'admin',
    nickname: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  async seed() {
    await this.repo.upsert(this.adminSeed, ['username']);
  }
}
