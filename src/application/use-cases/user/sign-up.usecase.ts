import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../ports/user.repository.interface';
import type { IUserRepository } from '../../ports/user.repository.interface';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute() {}
}
