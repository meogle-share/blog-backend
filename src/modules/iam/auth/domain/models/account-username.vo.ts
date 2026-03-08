import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class AccountUsername extends ValueObject<string> {
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

  static from(value: string): AccountUsername {
    const normalized = value.trim();
    return new AccountUsername(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('이메일은 필수입니다');
    }

    if (
      !Guard.lengthIsBetween(props.value, AccountUsername.MIN_LENGTH, AccountUsername.MAX_LENGTH)
    ) {
      throw new Error(
        `아이디(이메일)는 ${AccountUsername.MIN_LENGTH}자 이상 ${AccountUsername.MAX_LENGTH}자 이하여야 합니다`,
      );
    }

    if (!AccountUsername.EMAIL_REGEX.test(props.value)) {
      throw new Error('올바른 이메일 형식이 아닙니다');
    }
  }
}
