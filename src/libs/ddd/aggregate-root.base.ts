import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerPort } from '../log/logger.port';

/**
 * Aggregate Root 기본 클래스
 *
 * Aggregate Root는 도메인 이벤트를 발행할 수 있는 Entity입니다.
 * - 트랜잭션 경계: Aggregate 단위로 일관성 보장
 * - 이벤트 소싱: 상태 변경을 도메인 이벤트로 기록
 *
 * @template EntityProps - Entity의 도메인 속성 타입
 *
 * @example
 * interface PostProps {
 *   title: PostTitle;
 *   content: PostContent;
 * }
 *
 * class Post extends AggregateRoot<PostProps> {
 *   publish(): void {
 *     // 비즈니스 로직 실행
 *     this.validateCanPublish();
 *
 *     // 상태 변경
 *     this.props.status = 'published';
 *
 *     // 도메인 이벤트 추가 (외부 시스템에 알림)
 *     this.addEvent(new PostPublishedEvent({
 *       postId: this.id,
 *       title: this.props.title
 *     }));
 *   }
 * }
 *
 * // 사용
 * const post = new Post({ id, props });
 * post.publish();
 * await post.publishEvents(logger, eventEmitter); // 이벤트 발행
 */
export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  /**
   * 발행 대기 중인 도메인 이벤트 목록
   */
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._domainEvents]);
  }

  /**
   * 도메인 이벤트 추가
   * @param domainEvent - 추가할 도메인 이벤트
   */
  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  /**
   * 도메인 이벤트 목록 초기화
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * 도메인 이벤트 발행
   * @param logger - 로거
   * @param eventEmitter - 이벤트 발행기
   */
  public async publishEvents(logger: LoggerPort, eventEmitter: EventEmitter2): Promise<void> {
    await Promise.all(
      this.domainEvents.map(async (event) => {
        logger.debug(
          `[todo: write request id] "${
            event.constructor.name
          }" event published for aggregate ${this.constructor.name} : ${this.id.value}`,
        );
        return eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );
    this.clearEvents();
  }
}
