import { ApplicationException } from '@libs/exceptions';
import { IamErrorCode } from '@modules/iam/error-codes';

export class InvalidCredentialsException extends ApplicationException {
  constructor() {
    super({
      code: IamErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid credentials',
    });
  }
}
