import { Entity, CreateEntityParams } from '@libs/ddd';
import { Identifier } from '@libs/ddd';

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

class TestEntity extends Entity<TestProps> {
  constructor(params: CreateEntityParams<TestProps>) {
    super(params);
  }

  get name(): string {
    return this.props.name;
  }

  get value(): number {
    return this.props.value;
  }
}

describe('Entity', () => {
  const testId = TestId.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');
  const testProps: TestProps = {
    name: 'Test Entity',
    value: 42,
  };

  describe('constructor', () => {
    it('id와 props를 올바르게 설정해야 한다', () => {
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });

      expect(entity.id).toBe(testId);
      expect(entity.name).toBe(testProps.name);
      expect(entity.value).toBe(testProps.value);
    });

    it('createdAt과 updatedAt이 없으면 현재 시간으로 설정해야 한다', () => {
      const beforeCreate = new Date();
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });
      const afterCreate = new Date();

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('createdAt과 updatedAt이 주어지면 그 값을 사용해야 한다', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const updatedAt = new Date('2024-01-02T00:00:00Z');

      const entity = new TestEntity({
        id: testId,
        props: testProps,
        createdAt,
        updatedAt,
      });

      expect(entity.createdAt).toBe(createdAt);
      expect(entity.updatedAt).toBe(updatedAt);
    });
  });

  describe('validateProps', () => {
    it('빈 객체로 Entity 생성 시 에러를 발생시켜야 한다', () => {
      expect(() => {
        new TestEntity({
          id: testId,
          props: {} as TestProps,
        });
      }).toThrow('엔티티 속성은 비어있을 수 없습니다');
    });

    it('props가 객체가 아닌 경우 에러를 발생시켜야 한다', () => {
      expect(() => {
        new TestEntity({
          id: testId,

          props: 'not an object' as any,
        });
      }).toThrow('엔티티 속성은 객체여야 합니다');
    });

    it('props가 50개를 초과하면 에러를 발생시켜야 한다', () => {
      const tooManyProps: any = {};
      for (let i = 0; i < 51; i++) {
        tooManyProps[`prop${i}`] = i;
      }

      expect(() => {
        new TestEntity({
          id: testId,

          props: tooManyProps,
        });
      }).toThrow('엔티티 속성은 50개를 초과할 수 없습니다');
    });

    it('정상적인 props로 Entity를 생성할 수 있어야 한다', () => {
      expect(() => {
        new TestEntity({
          id: testId,
          props: testProps,
        });
      }).not.toThrow();
    });
  });

  describe('getters', () => {
    it('id getter가 올바른 값을 반환해야 한다', () => {
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });

      expect(entity.id).toBe(testId);
    });

    it('createdAt getter가 올바른 값을 반환해야 한다', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const entity = new TestEntity({
        id: testId,
        props: testProps,
        createdAt,
      });

      expect(entity.createdAt).toBe(createdAt);
    });

    it('updatedAt getter가 올바른 값을 반환해야 한다', () => {
      const updatedAt = new Date('2024-01-02T00:00:00Z');
      const entity = new TestEntity({
        id: testId,
        props: testProps,
        updatedAt,
      });

      expect(entity.updatedAt).toBe(updatedAt);
    });
  });

  describe('getProps', () => {
    it('모든 props를 반환해야 한다', () => {
      const createdAt = new Date('2024-01-01T00:00:00Z');
      const updatedAt = new Date('2024-01-02T00:00:00Z');

      const entity = new TestEntity({
        id: testId,
        props: testProps,
        createdAt,
        updatedAt,
      });

      const props = entity.getProps();

      expect(props.id).toBe(testId);
      expect(props.name).toBe(testProps.name);
      expect(props.value).toBe(testProps.value);
      expect(props.createdAt).toBe(createdAt);
      expect(props.updatedAt).toBe(updatedAt);
    });

    it('반환된 객체가 동결(freeze)되어야 한다', () => {
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });

      const props = entity.getProps();

      expect(Object.isFrozen(props)).toBe(true);
    });

    it('반환된 객체를 수정할 수 없어야 한다', () => {
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });

      const props = entity.getProps();

      expect(() => {
        props.name = 'Modified Name';
      }).toThrow();
    });

    it('매번 새로운 객체를 반환해야 한다', () => {
      const entity = new TestEntity({
        id: testId,
        props: testProps,
      });

      const props1 = entity.getProps();
      const props2 = entity.getProps();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });
  });

  describe('Entity 식별자 기반 비교', () => {
    it('같은 ID를 가진 Entity는 동등해야 한다', () => {
      const id = TestId.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');

      const entity1 = new TestEntity({
        id,
        props: { name: 'Entity 1', value: 1 },
      });

      const entity2 = new TestEntity({
        id,
        props: { name: 'Entity 2', value: 2 },
      });

      expect(entity1.id.equals(entity2.id)).toBe(true);
    });

    it('다른 ID를 가진 Entity는 다르다', () => {
      const id1 = TestId.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');
      const id2 = TestId.from('01930c8e-7d8a-7891-8b5e-3d9c8f6a5b4d');

      const entity1 = new TestEntity({
        id: id1,
        props: testProps,
      });

      const entity2 = new TestEntity({
        id: id2,
        props: testProps,
      });

      expect(entity1.id.equals(entity2.id)).toBe(false);
    });
  });
});
