import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '@libs/ddd';
import { User } from '@modules/iam/user/domain/models/user.aggregate';
import { TOKEN_PROVIDER } from '../auth.tokens';
import type { TokenProvider } from '../domain/ports/token-provider.port';

interface IssueTokenCommand {
  user: User;
}

interface IssueTokenResult {
  accessToken: string;
  user: User;
}

@Injectable()
export class IssueTokenUseCase implements UseCase<IssueTokenCommand, IssueTokenResult> {
  constructor(
    @Inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProvider,
  ) {}

  execute(command: IssueTokenCommand): IssueTokenResult {
    const accessToken = this.tokenProvider.generate(command.user);

    return { accessToken, user: command.user };
  }
}
