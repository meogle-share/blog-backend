import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';
import { InvalidUserException } from '../exceptions/invalid-user.exception';

export class UserNickName extends ValueObject<string> {
  static readonly MIN_LENGTH = 2;
  static readonly MAX_LENGTH = 15;
  private static readonly NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]+( [a-zA-Z0-9가-힣]+)*$/;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): UserNickName {
    const normalized = value.trim();
    return new UserNickName(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new InvalidUserException('Nickname is required');
    }

    if (!Guard.lengthIsBetween(props.value, UserNickName.MIN_LENGTH, UserNickName.MAX_LENGTH)) {
      throw new InvalidUserException(
        `Nickname must be between ${UserNickName.MIN_LENGTH} and ${UserNickName.MAX_LENGTH} characters`,
      );
    }

    if (!UserNickName.NICKNAME_REGEX.test(props.value)) {
      throw new InvalidUserException(
        'Nickname may only contain Korean, English, numbers, and single spaces between words',
      );
    }
  }
}
