import { Guard } from '@libs/guard';
import { DomainPrimitive, ValueObject } from '@libs/ddd';

export class AccountHashedPassword extends ValueObject<string> {
  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): AccountHashedPassword {
    return new AccountHashedPassword(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('비밀번호는 필수입니다');
    }
  }
}
