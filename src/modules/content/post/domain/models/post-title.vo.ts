import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class PostTitle extends ValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 300;

  private constructor(title: string) {
    super({ value: title });
  }

  static from(value: string): PostTitle {
    return new PostTitle(value);
  }

  protected validate(props: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(props.value, PostTitle.MIN_LENGTH, PostTitle.MAX_LENGTH)) {
      throw new Error(
        `Content must be between ${PostTitle.MIN_LENGTH} and ${PostTitle.MAX_LENGTH} characters`,
      );
    }
  }
}
