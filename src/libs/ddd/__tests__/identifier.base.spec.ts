import { Identifier } from '@libs/ddd';

class TestIdentifier extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(): TestIdentifier {
    return new TestIdentifier(Identifier.generateUuid());
  }

  static from(value: string): TestIdentifier {
    return new TestIdentifier(value);
  }
}

describe('Identifier', () => {
  describe('validate', () => {
    it('유효한 UUID v7로 생성할 수 있어야 한다', () => {
      const validUuidV7 = '01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c';

      const identifier = TestIdentifier.from(validUuidV7);

      expect(identifier.value).toBe(validUuidV7);
    });

    it('빈 문자열로 생성 시 에러를 던져야 한다', () => {
      expect(() => TestIdentifier.from('')).toThrow('식별자 값은 비어있을 수 없습니다');
    });

    it('잘못된 UUID 형식으로 생성 시 에러를 던져야 한다', () => {
      expect(() => TestIdentifier.from('invalid-uuid')).toThrow('올바르지 않은 UUID v7 형식입니다');
    });

    it('UUID v4 형식으로 생성 시 에러를 던져야 한다', () => {
      const uuidV4 = '550e8400-e29b-41d4-a716-446655440000'; // version 4

      expect(() => TestIdentifier.from(uuidV4)).toThrow('올바르지 않은 UUID v7 형식입니다');
    });

    it('일반 문자열로 생성 시 에러를 던져야 한다', () => {
      expect(() => TestIdentifier.from('test-id-123')).toThrow('올바르지 않은 UUID v7 형식입니다');
    });

    it('하이픈이 없는 UUID로 생성 시 에러를 던져야 한다', () => {
      const noHyphenUuid = '01930c8e7d8a78908b5e3d9c8f6a5b4c';

      expect(() => TestIdentifier.from(noHyphenUuid)).toThrow('올바르지 않은 UUID v7 형식입니다');
    });
  });

  describe('value', () => {
    it('생성자에 전달한 값을 반환해야 한다', () => {
      const idValue = '01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c';

      const identifier = TestIdentifier.from(idValue);

      expect(identifier.value).toBe(idValue);
    });
  });

  describe('equals', () => {
    it('같은 값을 가진 Identifier와 비교 시 true를 반환해야 한다', () => {
      const idValue = '01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c';
      const id1 = TestIdentifier.from(idValue);
      const id2 = TestIdentifier.from(idValue);

      expect(id1.equals(id2)).toBe(true);
    });

    it('다른 값을 가진 Identifier와 비교 시 false를 반환해야 한다', () => {
      const id1 = TestIdentifier.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');
      const id2 = TestIdentifier.from('01930c8e-7d8a-7891-8b5e-3d9c8f6a5b4d');

      expect(id1.equals(id2)).toBe(false);
    });

    it('undefined와 비교 시 false를 반환해야 한다', () => {
      const id = TestIdentifier.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');

      expect(id.equals(undefined)).toBe(false);
    });

    it('null과 비교 시 false를 반환해야 한다', () => {
      const id = TestIdentifier.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');

      // @ts-expect-error - null 테스트를 위한 타입 체크 무시
      expect(id.equals(null)).toBe(false);
    });
  });

  describe('generateUuid', () => {
    it('UUID v7 형식의 문자열을 생성해야 한다', () => {
      const identifier = TestIdentifier.create();

      expect(identifier.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('매번 다른 UUID를 생성해야 한다', () => {
      const id1 = TestIdentifier.create();
      const id2 = TestIdentifier.create();

      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('불변성', () => {
    it('객체가 동결(freeze)되어야 한다', () => {
      const identifier = TestIdentifier.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');

      expect(Object.isFrozen(identifier)).toBe(true);
    });

    it('value 속성을 변경할 수 없어야 한다', () => {
      const identifier = TestIdentifier.from('01930c8e-7d8a-7890-8b5e-3d9c8f6a5b4c');

      expect(() => {
        // @ts-expect-error - 불변성 테스트를 위한 타입 체크 무시
        identifier.value = 'new-value';
      }).toThrow();
    });
  });
});
