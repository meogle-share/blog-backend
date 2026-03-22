import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';
import { InvalidAccountException } from '../exceptions/invalid-account.exception';

export class SystemUsername extends ValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 254;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): SystemUsername {
    const normalized = value.trim();
    return new SystemUsername(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new InvalidAccountException('System username is required');
    }

    if (!Guard.lengthIsBetween(props.value, SystemUsername.MIN_LENGTH, SystemUsername.MAX_LENGTH)) {
      throw new InvalidAccountException(
        `System username must be between ${SystemUsername.MIN_LENGTH} and ${SystemUsername.MAX_LENGTH} characters`,
      );
    }
  }
}
