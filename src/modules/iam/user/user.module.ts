import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { UserRepositoryImpl } from '@modules/iam/user/infrastructure/user.repository.impl';
import { UserMapper } from '@modules/iam/user/infrastructure/user.mapper';
import { USER_REPOSITORY } from './user.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    UserMapper,
  ],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
