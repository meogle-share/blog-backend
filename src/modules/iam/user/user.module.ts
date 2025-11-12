import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { UserSeeder } from '@modules/iam/user/infrastructure/user.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  providers: [UserSeeder],
})
export class UserModule {}
