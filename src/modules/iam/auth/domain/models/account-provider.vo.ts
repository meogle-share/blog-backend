import { DomainPrimitive, ValueObject } from '@libs/ddd';

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
      throw new Error(
        `유효하지 않은 인증 제공자입니다: ${props.value}. 허용값: ${Object.values(Provider).join(', ')}`,
      );
    }
  }
}
