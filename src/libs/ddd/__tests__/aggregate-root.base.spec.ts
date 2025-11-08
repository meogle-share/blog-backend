import { AggregateRoot } from '@libs/ddd';
import { DomainEvent, DomainEventProps } from '@libs/ddd';
import { CreateEntityParams } from '@libs/ddd';
import { Identifier } from '@libs/ddd';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerPort } from '../../log/logger.port';

class TestId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(): TestId {
    return new TestId(Identifier.generateUuid());
  }

  static from(value: string): TestId {
    return new TestId(value);
  }
}

interface TestProps {
  name: string;
  value: number;
}

interface TestDomainEventProps {
  aggregateId: string;
  message: string;
}

class TestDomainEvent extends DomainEvent {
  public readonly message: string;

  constructor(props: DomainEventProps<TestDomainEventProps>) {
    super(props);
    this.message = props.message;
  }
}

class TestAggregateRoot extends AggregateRoot<TestProps> {
  constructor(params: CreateEntityParams<TestProps>) {
    super(params);
  }

  get name(): string {
    return this.props.name;
  }

  get value(): number {
    return this.props.value;
  }

  // addEvent는 protected이므로 public 메서드로 노출
  public testAddEvent(event: DomainEvent): void {
    this.addEvent(event);
  }
}

describe('AggregateRoot', () => {
  const testId = TestId.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');
  const testProps: TestProps = {
    name: 'Test Aggregate',
    value: 42,
  };

  describe('Entity 상속', () => {
    it('Entity의 속성을 상속받아야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      expect(aggregate.id).toBe(testId);
      expect(aggregate.name).toBe(testProps.name);
      expect(aggregate.value).toBe(testProps.value);
      expect(aggregate.createdAt).toBeInstanceOf(Date);
      expect(aggregate.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('domainEvents', () => {
    it('초기 상태에서 빈 배열을 반환해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      expect(aggregate.domainEvents).toEqual([]);
    });

    it('추가된 이벤트 목록을 반환해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 1',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 2',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.domainEvents[0]).toBe(event1);
      expect(aggregate.domainEvents[1]).toBe(event2);
    });

    it('반환된 배열이 동결(freeze)되어야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const events = aggregate.domainEvents;

      expect(Object.isFrozen(events)).toBe(true);
    });

    it('반환된 배열을 수정할 수 없어야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event',
      });

      aggregate.testAddEvent(event);

      const events = aggregate.domainEvents;

      expect(() => {
        // @ts-expect-error - 불변성 테스트를 위한 타입 체크 무시
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        events.push(
          new TestDomainEvent({
            aggregateId: testId.value,
            message: 'Another Event',
          }),
        );
      }).toThrow();
    });

    it('매번 새로운 배열을 반환해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const events1 = aggregate.domainEvents;
      const events2 = aggregate.domainEvents;

      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });
  });

  describe('addEvent', () => {
    it('도메인 이벤트를 추가해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event',
      });

      aggregate.testAddEvent(event);

      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBe(event);
    });

    it('여러 도메인 이벤트를 순서대로 추가해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'First Event',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Second Event',
      });

      const event3 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Third Event',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);
      aggregate.testAddEvent(event3);

      expect(aggregate.domainEvents).toHaveLength(3);
      expect(aggregate.domainEvents[0]).toBe(event1);
      expect(aggregate.domainEvents[1]).toBe(event2);
      expect(aggregate.domainEvents[2]).toBe(event3);
    });
  });

  describe('clearEvents', () => {
    it('도메인 이벤트 목록을 초기화해야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 1',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 2',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);

      expect(aggregate.domainEvents).toHaveLength(2);

      aggregate.clearEvents();

      expect(aggregate.domainEvents).toHaveLength(0);
      expect(aggregate.domainEvents).toEqual([]);
    });

    it('빈 목록에서 호출해도 에러가 발생하지 않아야 한다', () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      expect(() => {
        aggregate.clearEvents();
      }).not.toThrow();

      expect(aggregate.domainEvents).toEqual([]);
    });
  });

  describe('publishEvents', () => {
    let mockLogger: jest.Mocked<LoggerPort>;
    let mockEventEmitter: jest.Mocked<EventEmitter2>;

    beforeEach(() => {
      mockLogger = {
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      };

      mockEventEmitter = {
        emitAsync: jest.fn().mockResolvedValue(undefined),
      } as unknown as jest.Mocked<EventEmitter2>;
    });

    it('모든 도메인 이벤트를 발행해야 한다', async () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 1',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 2',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);

      await aggregate.publishEvents(mockLogger, mockEventEmitter);

      expect(mockEventEmitter.emitAsync).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('TestDomainEvent', event1);
      expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('TestDomainEvent', event2);
    });

    it('이벤트 발행 시 로그를 남겨야 한다', async () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event',
      });

      aggregate.testAddEvent(event);

      await aggregate.publishEvents(mockLogger, mockEventEmitter);

      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('TestDomainEvent'));
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('TestAggregateRoot'));
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining(testId.value));
    });

    it('이벤트 발행 후 이벤트 목록을 초기화해야 한다', async () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 1',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 2',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);

      expect(aggregate.domainEvents).toHaveLength(2);

      await aggregate.publishEvents(mockLogger, mockEventEmitter);

      expect(aggregate.domainEvents).toHaveLength(0);
      expect(aggregate.domainEvents).toEqual([]);
    });

    it('이벤트가 없을 때 호출해도 에러가 발생하지 않아야 한다', async () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      await expect(aggregate.publishEvents(mockLogger, mockEventEmitter)).resolves.not.toThrow();

      expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('이벤트 발행 중 에러가 발생해도 다른 이벤트를 발행해야 한다', async () => {
      const aggregate = new TestAggregateRoot({
        id: testId,
        props: testProps,
      });

      const event1 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 1',
      });

      const event2 = new TestDomainEvent({
        aggregateId: testId.value,
        message: 'Test Event 2',
      });

      aggregate.testAddEvent(event1);
      aggregate.testAddEvent(event2);

      mockEventEmitter.emitAsync
        .mockRejectedValueOnce(new Error('Event 1 failed'))
        .mockResolvedValueOnce([]);

      await expect(aggregate.publishEvents(mockLogger, mockEventEmitter)).rejects.toThrow(
        'Event 1 failed',
      );

      expect(mockEventEmitter.emitAsync).toHaveBeenCalledTimes(2);
    });
  });
});
