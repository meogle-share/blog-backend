import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';
import { InvalidPostException } from '../exceptions/invalid-post.exception';

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
    if (Guard.isEmpty(props.value)) {
      throw new InvalidPostException('Content is required');
    }

    if (!Guard.lengthIsBetween(props.value, PostContent.MIN_LENGTH, PostContent.MAX_LENGTH)) {
      throw new InvalidPostException(
        `Content must be between ${PostContent.MIN_LENGTH} and ${PostContent.MAX_LENGTH} characters`,
      );
    }
  }
}
