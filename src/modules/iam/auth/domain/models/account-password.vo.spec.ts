import { AccountPassword } from './account-password.vo';

describe('AccountPassword', () => {
  describe('from', () => {
    it('유효한 비밀번호로 UserPassword를 생성해야 한다', () => {
      const password = 'password123!';
      const userPassword = AccountPassword.from(password);

      expect(userPassword).toBeInstanceOf(AccountPassword);
      expect(userPassword.value).toBe(password);
    });

    it('다양한 형식의 유효한 비밀번호를 허용해야 한다', () => {
      const validPasswords = [
        'abcd1234', // 최소 길이 (8자)
        'a'.repeat(64), // 최대 길이 (64자)
        'Password123!', // 영문+숫자+특수문자
        '비밀번호1234567', // 한글+숫자
        'MyP@ssw0rd!', // 복잡한 비밀번호
        '12345678', // 숫자만
        'abcdefgh', // 영문만
        '!@#$%^&*', // 특수문자만
      ];

      validPasswords.forEach((password) => {
        const userPassword = AccountPassword.from(password);
        expect(userPassword.value).toBe(password);
      });
    });

    it('빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => AccountPassword.from('')).toThrow('비밀번호는 필수입니다');
    });

    it('공백만 있으면 에러를 던져야 한다', () => {
      expect(() => AccountPassword.from('   ')).toThrow('비밀번호는 공백만으로 구성될 수 없습니다');
    });

    it('최소 길이보다 짧으면 에러를 던져야 한다', () => {
      const shortPassword = 'short12'; // 7자

      expect(() => AccountPassword.from(shortPassword)).toThrow(
        `비밀번호는 ${AccountPassword.MIN_LENGTH}자 이상 ${AccountPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('최대 길이보다 길면 에러를 던져야 한다', () => {
      const longPassword = 'a'.repeat(65); // 65자

      expect(() => AccountPassword.from(longPassword)).toThrow(
        `비밀번호는 ${AccountPassword.MIN_LENGTH}자 이상 ${AccountPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('앞뒤 공백을 포함한 비밀번호를 그대로 저장해야 한다', () => {
      const passwordWithSpaces = '  password123  ';

      const userPassword = AccountPassword.from(passwordWithSpaces);

      expect(userPassword.value).toBe('  password123  ');
    });

    it('중간에 공백이 포함된 비밀번호를 허용해야 한다', () => {
      const passwordWithMiddleSpaces = 'my pass word';

      const userPassword = AccountPassword.from(passwordWithMiddleSpaces);

      expect(userPassword.value).toBe('my pass word');
    });

    it('공백으로 시작하거나 끝나는 8자 이상 비밀번호를 허용해야 한다', () => {
      const validPasswords = [
        ' password', // 앞 공백 (9자)
        'password ', // 뒤 공백 (9자)
        ' pass123 ', // 앞뒤 공백 (10자)
        '       a', // 공백 7개 + 문자 1개 (8자)
      ];

      validPasswords.forEach((password) => {
        const userPassword = AccountPassword.from(password);
        expect(userPassword.value).toBe(password);
      });
    });
  });
});
