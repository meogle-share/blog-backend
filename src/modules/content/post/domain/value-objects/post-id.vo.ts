import { Identifier } from '@libs/ddd/identifier.base';

export class PostId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static generate(): PostId {
    return new PostId(Identifier.generateUuid());
  }

  static from(value: string): PostId {
    return new PostId(value);
  }
}
