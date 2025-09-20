import { Module } from '@nestjs/common';
import { SignUpUseCase } from './user/sign-up.usecase';
import { RepositoryModule } from '../../infra/persistence/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [SignUpUseCase],
  exports: [SignUpUseCase],
})
export class UseCasesModule {}
