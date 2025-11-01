import { Guard } from '../guard';
import { Identifier } from '@libs/ddd/identifier.base';

export type EntityID = Identifier;

/**
 * Entity 기본 속성
 */
export interface BaseEntityProps {
  id: EntityID;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity 생성 파라미터
 * @template T - Entity의 도메인 속성 타입
 */
export interface CreateEntityParams<T> {
  id: EntityID;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entity 기본 클래스
 *
 * Entity는 식별자(ID)로 구분되는 도메인 객체입니다.
 * Value Object와 달리 ID로 동등성을 비교합니다.
 *
 * @template EntityProps - Entity의 도메인 속성 타입
 * - 도메인 속성: 비즈니스 로직과 관련된 Entity의 상태 (예: email, name, address)
 * - id, createdAt, updatedAt 같은 기술적 속성은 별도로 관리됨
 *
 * @example
 * // 1. 도메인 속성 정의 (비즈니스 개념)
 * interface UserProps {
 *   email: Email;
 *   name: UserName;
 * }
 *
 * // 2. Entity 생성
 * class User extends Entity<UserProps> {
 *   constructor(params: CreateEntityParams<UserProps>) {
 *     super(params);
 *   }
 *
 *   get email(): Email {
 *     return this.props.email;
 *   }
 * }
 *
 * // 3. 사용
 * const user = new User({
 *   id: UserId.create(),        // 기술적 속성 (자동 관리)
 *   props: { email, name }       // 도메인 속성 (명시적 전달)
 * });
 */
export abstract class Entity<EntityProps> {
  protected readonly _id: EntityID;
  protected readonly props: EntityProps;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: CreateEntityParams<EntityProps>) {
    this.validateProps(params.props);
    const now = new Date();
    this._id = params.id;
    this._createdAt = params.createdAt || now;
    this._updatedAt = params.updatedAt || now;
    this.props = params.props;
  }

  get id(): EntityID {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Returns entity properties.
   * @return {*}  {Props & EntityProps}
   * @memberof Entity
   */
  getProps(): EntityProps & BaseEntityProps {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }

  private validateProps(props: EntityProps): void {
    const MAX_PROPS = 50;

    if (Guard.isEmpty(props)) {
      throw new Error('Entity props should not be empty');
    }
    if (typeof props !== 'object') {
      throw new Error('Entity props should be an object');
    }
    if (Object.keys(props as any).length > MAX_PROPS) {
      throw new Error(`Entity props should not have more than ${MAX_PROPS} properties`);
    }
  }
}
