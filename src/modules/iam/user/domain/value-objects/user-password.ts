import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class UserPassword extends ValueObject<string> {
  /**
   * NIST SP 800-63B 권고사항
   */
  static readonly MIN_LENGTH = 8;
  static readonly MAX_LENGTH = 64;
  private static readonly ONLY_WHITESPACE = /^\s*$/;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): UserPassword {
    return new UserPassword(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('비밀번호는 필수입니다');
    }

    if (UserPassword.ONLY_WHITESPACE.test(props.value)) {
      throw new Error('비밀번호는 공백만으로 구성될 수 없습니다');
    }

    if (!Guard.lengthIsBetween(props.value, UserPassword.MIN_LENGTH, UserPassword.MAX_LENGTH)) {
      throw new Error(
        `비밀번호는 ${UserPassword.MIN_LENGTH}자 이상 ${UserPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    }
  }
}
