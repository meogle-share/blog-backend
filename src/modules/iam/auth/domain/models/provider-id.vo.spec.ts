import { ProviderId } from './provider-id.vo';

describe('ProviderId', () => {
  it('유효한 값으로 생성할 수 있다', () => {
    const id = ProviderId.from('12345');

    expect(id.value).toBe('12345');
  });

  it('빈 문자열이면 예외를 던진다', () => {
    expect(() => ProviderId.from('')).toThrow('Provider ID는 필수입니다');
  });
});
