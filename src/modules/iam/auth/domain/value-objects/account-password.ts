import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class AccountPassword extends ValueObject<string> {
  /**
   * NIST SP 800-63B 권고사항
   */
  static readonly MIN_LENGTH = 8;
  static readonly MAX_LENGTH = 64;
  private static readonly ONLY_WHITESPACE = /^\s*$/;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): AccountPassword {
    return new AccountPassword(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('비밀번호는 필수입니다');
    }

    if (AccountPassword.ONLY_WHITESPACE.test(props.value)) {
      throw new Error('비밀번호는 공백만으로 구성될 수 없습니다');
    }

    if (
      !Guard.lengthIsBetween(props.value, AccountPassword.MIN_LENGTH, AccountPassword.MAX_LENGTH)
    ) {
      throw new Error(
        `비밀번호는 ${AccountPassword.MIN_LENGTH}자 이상 ${AccountPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    }
  }
}
