import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';
import { InvalidUserException } from '../exceptions/invalid-user.exception';

export class UserEmail extends ValueObject<string> {
  static readonly MIN_LENGTH = 5;
  static readonly MAX_LENGTH = 254;
  /**
   * RFC 5322
   */
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): UserEmail {
    const normalized = value.trim();
    return new UserEmail(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new InvalidUserException('Email is required');
    }

    if (!Guard.lengthIsBetween(props.value, UserEmail.MIN_LENGTH, UserEmail.MAX_LENGTH)) {
      throw new InvalidUserException(
        `Email must be between ${UserEmail.MIN_LENGTH} and ${UserEmail.MAX_LENGTH} characters`,
      );
    }

    if (!UserEmail.EMAIL_REGEX.test(props.value)) {
      throw new InvalidUserException('Invalid email format');
    }
  }
}
