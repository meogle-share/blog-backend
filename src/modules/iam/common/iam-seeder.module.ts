import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { IamSeeder } from '@modules/iam/common/iam.seeder';
import { PASSWORD_HASH_SERVICE } from '@modules/iam/auth/domain/password-hash.service.interface';
import { BcryptPasswordHashService } from '@modules/iam/auth/infrastructure/bcrypt-password-hash.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel, UserModel])],
  providers: [
    IamSeeder,
    { provide: PASSWORD_HASH_SERVICE, useClass: BcryptPasswordHashService },
  ],
})
export class IamSeederModule {}
