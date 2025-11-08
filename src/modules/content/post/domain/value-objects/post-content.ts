import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class PostContent extends ValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 100000;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): PostContent {
    return new PostContent(value);
  }

  protected validate(props: DomainPrimitive<string>): void {
    if (!Guard.lengthIsBetween(props.value, PostContent.MIN_LENGTH, PostContent.MAX_LENGTH)) {
      throw new Error(
        `Content must be between ${PostContent.MIN_LENGTH} and ${PostContent.MAX_LENGTH} characters`,
      );
    }
  }
}
