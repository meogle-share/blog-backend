import { Inject, Injectable } from '@nestjs/common';
import type { PasswordCredentialRepositoryPort } from '../domain/ports/password-credential.repository.port';
import type { UserRepositoryPort } from '@modules/iam/user/domain/ports/user.repository.port';
import { PASSWORD_CREDENTIAL_REPOSITORY } from '../auth.tokens';
import { USER_REPOSITORY } from '@modules/iam/user/user.tokens';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { PasswordService } from '../domain/services/password.service';
import { UseCase } from '@libs/ddd';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

interface SignInCommand {
  email: string;
  password: string;
}

@Injectable()
export class SignInUseCase implements UseCase<SignInCommand, User> {
  constructor(
    @Inject(PASSWORD_CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: PasswordCredentialRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: SignInCommand): Promise<User> {
    const credential = await this.credentialRepository.findOneByEmail(command.email);
    if (!credential) {
      throw new InvalidCredentialsException();
    }

    const { userId, hashedPassword } = credential.getProps();
    const isMatched = await this.passwordService.verifyPassword(command.password, hashedPassword);
    if (!isMatched) {
      throw new InvalidCredentialsException();
    }

    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    return user;
  }
}
