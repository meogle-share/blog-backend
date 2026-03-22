import { DomainException } from '@libs/exceptions';
import { IamErrorCode } from '@modules/iam/error-codes';

export class InvalidUserException extends DomainException {
  constructor(message: string) {
    super({
      code: IamErrorCode.INVALID_USER,
      message,
    });
  }
}
