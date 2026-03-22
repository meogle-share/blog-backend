import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class ProviderId extends ValueObject<string> {
  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): ProviderId {
    return new ProviderId(value);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('Provider ID는 필수입니다');
    }
  }
}
