import { DomainException } from '@libs/exceptions';
import { ContentErrorCode } from '@modules/content/error-codes';

export class InvalidPostException extends DomainException {
  constructor(message: string) {
    super({
      code: ContentErrorCode.INVALID_POST,
      message,
    });
  }
}
