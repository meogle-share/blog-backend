import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import type { UserRepositoryPort } from '@modules/iam/user/domain/ports/user.repository.port';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import type { UseCase } from '@libs/ddd';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

@Injectable()
export class ResolveTokenUserUseCase implements UseCase<string, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }
    return user;
  }
}
