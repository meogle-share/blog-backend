import { Guard } from '@libs/guard';
import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { InvalidAccountException } from '../exceptions/invalid-account.exception';

export class AccountHashedPassword extends ValueObject<string> {
  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): AccountHashedPassword {
    return new AccountHashedPassword(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new InvalidAccountException('Hashed password is required');
    }
  }
}
