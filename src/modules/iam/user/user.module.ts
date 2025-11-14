import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  providers: [],
})
export class UserModule {}
