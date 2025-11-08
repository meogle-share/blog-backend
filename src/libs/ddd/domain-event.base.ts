import { Guard } from '../guard';
import { v7 as uuidv7 } from 'uuid';

type DomainEventMetadata = {
  /** 도메인 이벤트가 발생한 시간 */
  readonly timestamp: number;

  /** 연관성 추적을 위한 ID (통합 이벤트, 로그 상관관계 등에 사용) */
  readonly correlationId: string;

  /** 필요 시 실행 순서를 재구성하기 위해 사용되는 인과관계 ID */
  readonly causationId?: string;

  /** 디버깅 및 로깅 목적의 사용자 ID */
  readonly userId?: string;
};

/**
 * 도메인 이벤트 생성 파라미터
 * @template T - 이벤트 데이터 타입
 */
export type DomainEventProps<T> = Omit<T, 'id' | 'metadata'> & {
  aggregateId: string;
  metadata?: DomainEventMetadata;
};

/**
 * Domain Event 기본 클래스
 *
 * 도메인 이벤트는 비즈니스적으로 의미있는 상태 변경을 나타냅니다.
 * - 과거형 명명 (예: PostPublished, UserRegistered)
 * - 불변 객체
 * - 이벤트 추적을 위한 메타데이터 포함
 *
 * @example
 * interface PostPublishedProps {
 *   postId: string;
 *   title: string;
 *   publishedAt: Date;
 * }
 *
 * class PostPublishedEvent extends DomainEvent {
 *   public readonly postId: string;
 *   public readonly title: string;
 *   public readonly publishedAt: Date;
 *
 *   constructor(props: DomainEventProps<PostPublishedProps>) {
 *     super(props);
 *     this.postId = props.postId;
 *     this.title = props.title;
 *     this.publishedAt = props.publishedAt;
 *   }
 * }
 *
 * // 사용 (Aggregate Root 내부)
 * class Post extends AggregateRoot<PostProps> {
 *   publish(): void {
 *     // 상태 변경
 *     this.props.status = 'published';
 *
 *     // 이벤트 추가
 *     this.addEvent(new PostPublishedEvent({
 *       aggregateId: this.id.getValue(),
 *       postId: this.id.getValue(),
 *       title: this.props.title.value,
 *       publishedAt: new Date()
 *     }));
 *   }
 * }
 */
export abstract class DomainEvent {
  public readonly id: string;
  /** 도메인 이벤트가 발생했던 애그리거트 ID */
  public readonly aggregateId: string;
  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps<unknown>) {
    if (Guard.isEmpty(props)) {
      throw new Error('도메인 이벤트 속성은 비어있을 수 없습니다');
    }
    this.id = uuidv7();
    this.aggregateId = props.aggregateId;
    this.metadata = {
      correlationId: props?.metadata?.correlationId || 'todo: need request id',
      causationId: props?.metadata?.causationId,
      timestamp: props?.metadata?.timestamp || Date.now(),
      userId: props?.metadata?.userId,
    };
  }
}
