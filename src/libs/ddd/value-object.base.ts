/**
 * 원시 타입
 */
export type Primitives = string | number | boolean;

/**
 * 단일 원시값을 감싸는 구조
 * @example { value: "hello" }, { value: 123 }, { value: new Date() }
 */
export interface DomainPrimitive<T extends Primitives | Date> {
  value: T;
}

/**
 * ValueObject props 타입 결정
 * - T가 원시값/Date → { value: T }
 * - T가 객체 → T 그대로
 */
type ValueObjectProps<T> = T extends Primitives | Date ? DomainPrimitive<T> : T;

/**
 * Value Object 기본 클래스
 *
 * @template T - 감싸는 값의 타입
 * - 원시값(string, number, boolean, Date): super({ value: T }) 형태로 전달
 * - 복합객체: super(T) 형태로 전달
 *
 * @example
 * // 원시값
 * class Email extends ValueObject<string> {
 *   constructor(email: string) { super({ value: email }); }
 * }
 *
 * // 복합객체
 * class Money extends ValueObject<{amount: number, currency: string}> {
 *   constructor(props) { super(props); }
 * }
 */
export abstract class ValueObject<T> {
  protected readonly props: Readonly<ValueObjectProps<T>>;

  protected constructor(props: ValueObjectProps<T>) {
    this.validate(props);

    if (this.isDomainPrimitive(props)) {
      this.props = Object.freeze(props);
    } else {
      const deepCopy = structuredClone(props);
      this.props = this.deepFreeze(deepCopy);
    }
  }

  protected abstract validate(props: ValueObjectProps<T>): void;

  static isValueObject(obj: unknown): obj is ValueObject<unknown> {
    return obj instanceof ValueObject;
  }

  get value(): T {
    if (this.isDomainPrimitive(this.props)) {
      return this.props.value;
    }
    return this.props as T;
  }

  /**
   * 두 Value Object가 동등한지 확인합니다. 구조적 동등성을 검사합니다.
   * @param vo ValueObject
   */
  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return JSON.stringify(this) === JSON.stringify(vo);
  }

  private isDomainPrimitive(obj: unknown): obj is DomainPrimitive<T & (Primitives | Date)> {
    return Object.prototype.hasOwnProperty.call(obj, 'value');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private deepFreeze<T>(obj: T): T {
    Object.freeze(obj);

    if (this.isRecord(obj)) {
      Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value = obj[prop];

        if (this.isRecord(value) && !Object.isFrozen(value)) {
          this.deepFreeze(value);
        }
      });
    }

    return obj;
  }
}
