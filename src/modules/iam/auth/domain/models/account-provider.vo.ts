import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { InvalidAccountException } from '../exceptions/invalid-account.exception';

export enum Provider {
  GITHUB = 'github',
}

export class AccountProvider extends ValueObject<string> {
  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): AccountProvider {
    return new AccountProvider(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (!Object.values(Provider).includes(props.value as Provider)) {
      throw new InvalidAccountException(
        `Invalid auth provider: ${props.value}. Allowed: ${Object.values(Provider).join(', ')}`,
      );
    }
  }
}
