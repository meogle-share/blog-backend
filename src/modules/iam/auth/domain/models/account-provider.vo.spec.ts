import { AccountProvider, Provider } from './account-provider.vo';

describe('AccountProvider', () => {
  it.each(Object.values(Provider))('유효한 provider "%s"로 생성할 수 있다', (provider) => {
    const vo = AccountProvider.from(provider);

    expect(vo.value).toBe(provider);
  });

  it.each(['', 'local', 'google', 'facebook', 'invalid'])(
    '유효하지 않은 provider "%s"이면 예외를 던진다',
    (provider) => {
      expect(() => AccountProvider.from(provider)).toThrow();
    },
  );
});
