import { ValidationError } from 'class-validator';
import { parseValidationErrors } from './validation-error.parser';

describe('parseValidationErrors', () => {
  it('단일 필드의 제약조건을 파싱한다', () => {
    const errors: ValidationError[] = [
      {
        property: 'title',
        constraints: {
          isNotEmpty: 'title should not be empty',
          minLength: 'title must be longer than or equal to 1 characters',
        },
      },
    ];

    const result = parseValidationErrors(errors);

    expect(result).toEqual({
      title: ['title should not be empty', 'title must be longer than or equal to 1 characters'],
    });
  });

  it('여러 필드의 제약조건을 파싱한다', () => {
    const errors: ValidationError[] = [
      {
        property: 'title',
        constraints: { isNotEmpty: 'title should not be empty' },
      },
      {
        property: 'authorId',
        constraints: { isUuid: 'authorId must be a UUID' },
      },
    ];

    const result = parseValidationErrors(errors);

    expect(result).toEqual({
      title: ['title should not be empty'],
      authorId: ['authorId must be a UUID'],
    });
  });

  it('중첩 객체의 제약조건을 점 표기법으로 파싱한다', () => {
    const errors: ValidationError[] = [
      {
        property: 'address',
        children: [
          {
            property: 'city',
            constraints: { isNotEmpty: 'city should not be empty' },
          },
          {
            property: 'zipCode',
            constraints: { isPostalCode: 'zipCode must be a valid postal code' },
          },
        ],
      },
    ];

    const result = parseValidationErrors(errors);

    expect(result).toEqual({
      'address.city': ['city should not be empty'],
      'address.zipCode': ['zipCode must be a valid postal code'],
    });
  });

  it('constraints가 없는 에러는 건너뛴다', () => {
    const errors: ValidationError[] = [
      {
        property: 'title',
      },
    ];

    const result = parseValidationErrors(errors);

    expect(result).toEqual({});
  });

  it('빈 배열이면 빈 객체를 반환한다', () => {
    const result = parseValidationErrors([]);

    expect(result).toEqual({});
  });
});
