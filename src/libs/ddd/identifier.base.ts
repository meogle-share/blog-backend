import { v7 as uuidv7 } from 'uuid';

/**
 * Identifier 기본 클래스
 *
 * Entity의 고유 식별자를 나타냅니다.
 * UUID v7 기반
 *
 * @example
 * class UserId extends Identifier {
 *   private constructor(value: string) {
 *     super(value);
 *   }
 *
 *   // 새 ID 생성
 *   static create(): UserId {
 *     return new UserId(this.generateUuid());
 *   }
 *
 *   // 기존 ID로부터 생성 (DB 조회 시)
 *   static from(value: string): UserId {
 *     return new UserId(value);
 *   }
 * }
 *
 * // 사용
 * const newId = UserId.create();
 * const existingId = UserId.from("01912345-6789-7abc-def0-123456789abc");
 * newId.equals(existingId); // false
 */
export abstract class Identifier {
  private static readonly UUID_V7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  protected constructor(private readonly _id: string) {
    this.validate(_id);
    Object.freeze(this);
  }

  get value(): string {
    return this._id;
  }

  equals(other?: Identifier): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('식별자 값은 비어있을 수 없습니다');
    }

    if (!Identifier.UUID_V7_REGEX.test(value)) {
      throw new Error(`올바르지 않은 UUID v7 형식입니다: ${value}`);
    }
  }

  protected static generateUuid(): string {
    return uuidv7();
  }
}
