import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';
import { InvalidAccountException } from '../exceptions/invalid-account.exception';

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
      throw new InvalidAccountException('Password is required');
    }

    if (AccountPassword.ONLY_WHITESPACE.test(props.value)) {
      throw new InvalidAccountException('Password must not consist of only whitespace');
    }

    if (
      !Guard.lengthIsBetween(props.value, AccountPassword.MIN_LENGTH, AccountPassword.MAX_LENGTH)
    ) {
      throw new InvalidAccountException(
        `Password must be between ${AccountPassword.MIN_LENGTH} and ${AccountPassword.MAX_LENGTH} characters`,
      );
    }
  }

  matches(password: string): boolean {
    return this.props.value === password;
  }
}
