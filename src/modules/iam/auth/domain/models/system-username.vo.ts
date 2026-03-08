import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class SystemUsername extends ValueObject<string> {
  static readonly MIN_LENGTH = 1;
  static readonly MAX_LENGTH = 254;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): SystemUsername {
    const normalized = value.trim();
    return new SystemUsername(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('시스템 사용자명은 필수입니다');
    }

    if (!Guard.lengthIsBetween(props.value, SystemUsername.MIN_LENGTH, SystemUsername.MAX_LENGTH)) {
      throw new Error(
        `시스템 사용자명은 ${SystemUsername.MIN_LENGTH}자 이상 ${SystemUsername.MAX_LENGTH}자 이하여야 합니다`,
      );
    }
  }
}
