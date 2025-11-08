import { Identifier } from '@libs/ddd/identifier.base';

export class UserId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static generate(): UserId {
    return new UserId(Identifier.generateUuid());
  }

  static from(value: string): UserId {
    return new UserId(value);
  }
}
