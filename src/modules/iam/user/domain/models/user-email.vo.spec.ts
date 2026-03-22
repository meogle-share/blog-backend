import { InvalidUserException } from '../exceptions/invalid-user.exception';
import { UserEmail } from './user-email.vo';

describe('UserEmail', () => {
  it('유효한 이메일로 생성할 수 있다', () => {
    const email = UserEmail.from('test@example.com');

    expect(email.value).toBe('test@example.com');
  });

  it('앞뒤 공백을 제거한다', () => {
    const email = UserEmail.from('  test@example.com  ');

    expect(email.value).toBe('test@example.com');
  });

  it('빈 문자열이면 예외를 던진다', () => {
    expect(() => UserEmail.from('')).toThrow(InvalidUserException);
  });

  it('이메일 형식이 아니면 예외를 던진다', () => {
    expect(() => UserEmail.from('not-an-email')).toThrow(InvalidUserException);
  });

  it('최소 길이 미만이면 예외를 던진다', () => {
    expect(() => UserEmail.from('a@b')).toThrow(InvalidUserException);
  });

  it('최대 길이를 초과하면 예외를 던진다', () => {
    const longLocal = 'a'.repeat(250);
    expect(() => UserEmail.from(`${longLocal}@example.com`)).toThrow(InvalidUserException);
  });
});
