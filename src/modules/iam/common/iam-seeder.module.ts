import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { IamSeeder } from '@modules/iam/common/iam.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel, UserModel])],
  providers: [IamSeeder],
})
export class IamSeederModule {}
