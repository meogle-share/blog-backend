import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModel } from '@modules/iam/auth/infrastructure/account.model';

@Module({
  imports: [TypeOrmModule.forFeature([AccountModel])],
  providers: [],
})
export class AuthModule {}
