import { DomainPrimitive, ValueObject } from '@libs/ddd';

describe('ValueObject', () => {
  describe('원시값 Value Object', () => {
    class TestStringValue extends ValueObject<string> {
      private constructor(value: string) {
        super({ value });
      }

      static from(value: string): TestStringValue {
        return new TestStringValue(value);
      }

      protected validate(props: DomainPrimitive<string>): void {
        if (!props.value || props.value.length === 0) {
          throw new Error('Value cannot be empty');
        }
      }
    }

    class TestNumberValue extends ValueObject<number> {
      private constructor(value: number) {
        super({ value });
      }

      static from(value: number): TestNumberValue {
        return new TestNumberValue(value);
      }

      protected validate(props: DomainPrimitive<number>): void {
        if (props.value < 0) {
          throw new Error('Value cannot be negative');
        }
      }
    }

    describe('value getter', () => {
      it('string 타입의 원시값을 반환해야 한다', () => {
        const value = 'test-value';
        const vo = TestStringValue.from(value);

        expect(vo.value).toBe(value);
      });

      it('number 타입의 원시값을 반환해야 한다', () => {
        const value = 42;
        const vo = TestNumberValue.from(value);

        expect(vo.value).toBe(value);
      });
    });

    describe('불변성', () => {
      it('props는 불변이어야 한다', () => {
        const vo = TestStringValue.from('test');

        expect(() => {
          // @ts-expect-error - 불변성 테스트
          vo.props.value = 'changed';
        }).toThrow();
      });
    });

    describe('equals', () => {
      it('동일한 값을 가진 ValueObject는 같아야 한다', () => {
        const vo1 = TestStringValue.from('same-value');
        const vo2 = TestStringValue.from('same-value');

        expect(vo1.equals(vo2)).toBe(true);
      });

      it('다른 값을 가진 ValueObject는 달라야 한다', () => {
        const vo1 = TestStringValue.from('value-1');
        const vo2 = TestStringValue.from('value-2');

        expect(vo1.equals(vo2)).toBe(false);
      });

      it('null과 비교하면 false를 반환해야 한다', () => {
        const vo = TestStringValue.from('value');

        // @ts-expect-error - null 비교 테스트
        expect(vo.equals(null)).toBe(false);
      });

      it('undefined와 비교하면 false를 반환해야 한다', () => {
        const vo = TestStringValue.from('value');

        expect(vo.equals(undefined)).toBe(false);
      });

      it('다른 타입의 ValueObject와 비교하면 false를 반환해야 한다', () => {
        const stringVo = TestStringValue.from('42');
        const numberVo = TestNumberValue.from(42);

        // @ts-expect-error - 타입 호환성 테스트
        expect(stringVo.equals(numberVo)).toBe(false);
      });
    });

    describe('validation', () => {
      it('string validation이 실패하면 생성이 실패해야 한다', () => {
        expect(() => TestStringValue.from('')).toThrow('Value cannot be empty');
      });

      it('number validation이 실패하면 생성이 실패해야 한다', () => {
        expect(() => TestNumberValue.from(-1)).toThrow('Value cannot be negative');
      });
    });
  });

  describe('복합 객체 Value Object', () => {
    /**
     * 테스트용 복합 객체 ValueObject
     */
    interface ComplexProps {
      name: string;
      age: number;
    }

    class TestComplexValue extends ValueObject<ComplexProps> {
      private constructor(props: ComplexProps) {
        super(props);
      }

      static from(props: ComplexProps): TestComplexValue {
        return new TestComplexValue(props);
      }

      protected validate(props: ComplexProps): void {
        if (!props.name || props.age < 0) {
          throw new Error('Invalid props');
        }
      }
    }

    describe('value getter', () => {
      it('복합 객체를 반환해야 한다', () => {
        const props = { name: 'test', age: 30 };
        const vo = TestComplexValue.from(props);

        expect(vo.value).toEqual(props);
      });

      it('반환된 객체는 원본과 다른 참조여야 한다 (deep copy)', () => {
        const props = { name: 'test', age: 30 };
        const vo = TestComplexValue.from(props);

        expect(vo.value).not.toBe(props);
      });
    });

    describe('불변성', () => {
      it('props는 deep freeze되어 있어야 한다', () => {
        const vo = TestComplexValue.from({ name: 'test', age: 30 });

        expect(() => {
          // @ts-expect-error - 불변성 테스트
          vo.props.name = 'changed';
        }).toThrow();
      });
    });

    describe('equals', () => {
      it('동일한 값을 가진 복합 ValueObject는 같아야 한다', () => {
        const vo1 = TestComplexValue.from({ name: 'test', age: 30 });
        const vo2 = TestComplexValue.from({ name: 'test', age: 30 });

        expect(vo1.equals(vo2)).toBe(true);
      });

      it('다른 값을 가진 복합 ValueObject는 달라야 한다', () => {
        const vo1 = TestComplexValue.from({ name: 'test1', age: 30 });
        const vo2 = TestComplexValue.from({ name: 'test2', age: 30 });

        expect(vo1.equals(vo2)).toBe(false);
      });
    });

    describe('validation', () => {
      it('복합 객체 validation이 실패하면 생성이 실패해야 한다', () => {
        expect(() => TestComplexValue.from({ name: '', age: 30 })).toThrow('Invalid props');
      });
    });
  });

  describe('isValueObject', () => {
    /**
     * 테스트용 간단한 ValueObject
     */
    class SimpleValue extends ValueObject<string> {
      private constructor(value: string) {
        super({ value });
      }

      static from(value: string): SimpleValue {
        return new SimpleValue(value);
      }

      protected validate(): void {
        // validation 없음
      }
    }

    it('ValueObject 인스턴스에 대해 true를 반환해야 한다', () => {
      const vo = SimpleValue.from('test');

      expect(ValueObject.isValueObject(vo)).toBe(true);
    });

    it('일반 객체에 대해 false를 반환해야 한다', () => {
      const obj = { value: 'test' };

      expect(ValueObject.isValueObject(obj)).toBe(false);
    });

    it('null에 대해 false를 반환해야 한다', () => {
      expect(ValueObject.isValueObject(null)).toBe(false);
    });

    it('undefined에 대해 false를 반환해야 한다', () => {
      expect(ValueObject.isValueObject(undefined)).toBe(false);
    });
  });
});
