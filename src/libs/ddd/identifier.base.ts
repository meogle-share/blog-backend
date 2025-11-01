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
  protected constructor(private readonly _id: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this._id;
  }

  equals(other?: Identifier): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  protected static generateUuid(): string {
    return uuidv7();
  }
}
