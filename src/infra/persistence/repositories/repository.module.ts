import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../application/ports/user.repository.interface';
import { UserDatabaseRepository } from './user.database.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../typeorm/entities/user.entity';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserDatabaseRepository,
    },
  ],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [USER_REPOSITORY],
})
export class RepositoryModule {}
