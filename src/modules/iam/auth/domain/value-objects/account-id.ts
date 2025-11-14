import { Identifier } from '@libs/ddd/identifier.base';

export class AccountId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static generate(): AccountId {
    return new AccountId(Identifier.generateUuid());
  }

  static from(value: string): AccountId {
    return new AccountId(value);
  }
}
