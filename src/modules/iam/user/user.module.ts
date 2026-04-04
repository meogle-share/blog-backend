import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '@modules/iam/user/infrastructure/user.model';
import { UserRepository } from '@modules/iam/user/infrastructure/user.repository';
import { UserMapper } from '@modules/iam/user/infrastructure/user.mapper';
import { UserHttpController } from './presentation/user.http.controller';
import { USER_REPOSITORY } from './user.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  controllers: [UserHttpController],
  providers: [{ provide: USER_REPOSITORY, useClass: UserRepository }, UserMapper],
  exports: [USER_REPOSITORY],
})
export class UserModule {}
