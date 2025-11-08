import { DomainPrimitive, ValueObject } from '@libs/ddd';
import { Guard } from '@libs/guard';

export class UserNickName extends ValueObject<string> {
  static readonly MIN_LENGTH = 2;
  static readonly MAX_LENGTH = 15;
  private static readonly NICKNAME_REGEX = /^[a-zA-Z0-9가-힣]+( [a-zA-Z0-9가-힣]+)*$/;

  private constructor(content: string) {
    super({ value: content });
  }

  static from(value: string): UserNickName {
    const normalized = value.trim();
    return new UserNickName(normalized);
  }

  protected validate(props: DomainPrimitive<string>) {
    if (Guard.isEmpty(props.value)) {
      throw new Error('닉네임은 필수입니다');
    }

    if (!Guard.lengthIsBetween(props.value, UserNickName.MIN_LENGTH, UserNickName.MAX_LENGTH)) {
      throw new Error(
        `닉네임은 ${UserNickName.MIN_LENGTH}자 이상 ${UserNickName.MAX_LENGTH}자 이하여야 합니다`,
      );
    }

    if (!UserNickName.NICKNAME_REGEX.test(props.value)) {
      throw new Error('닉네임은 한글, 영문, 숫자와 단어 사이 1개의 공백만 사용할 수 있습니다');
    }
  }
}
