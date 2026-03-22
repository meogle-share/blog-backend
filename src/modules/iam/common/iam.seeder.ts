import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { PasswordCredentialModel } from '@modules/iam/auth/infrastructure/password-credential.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { PASSWORD_HASHER } from '@modules/iam/auth/auth.tokens';
import type { PasswordHasher } from '@modules/iam/auth/domain/ports/password-hasher.port';

@Injectable()
export class IamSeeder implements OnModuleInit {
  constructor(
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

    const userId = uuidv7();
    const hashedPassword = await this.passwordHashService.hash('admin12345');

    await this.userRepo.save({
      id: userId,
      nickname: 'admin',
      email: 'admin@admin.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.credentialRepo.save({
      id: uuidv7(),
      userId: userId,
      email: 'admin@admin.com',
      hashedPassword: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
