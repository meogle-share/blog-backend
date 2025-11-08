import { UserPassword } from './user-password';

describe('UserPassword', () => {
  describe('from', () => {
    it('유효한 비밀번호로 UserPassword를 생성해야 한다', () => {
      const password = 'password123!';
      const userPassword = UserPassword.from(password);

      expect(userPassword).toBeInstanceOf(UserPassword);
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
        const userPassword = UserPassword.from(password);
        expect(userPassword.value).toBe(password);
      });
    });

    it('빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => UserPassword.from('')).toThrow('비밀번호는 필수입니다');
    });

    it('공백만 있으면 에러를 던져야 한다', () => {
      expect(() => UserPassword.from('   ')).toThrow('비밀번호는 공백만으로 구성될 수 없습니다');
    });

    it('최소 길이보다 짧으면 에러를 던져야 한다', () => {
      const shortPassword = 'short12'; // 7자

      expect(() => UserPassword.from(shortPassword)).toThrow(
        `비밀번호는 ${UserPassword.MIN_LENGTH}자 이상 ${UserPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('최대 길이보다 길면 에러를 던져야 한다', () => {
      const longPassword = 'a'.repeat(65); // 65자

      expect(() => UserPassword.from(longPassword)).toThrow(
        `비밀번호는 ${UserPassword.MIN_LENGTH}자 이상 ${UserPassword.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('앞뒤 공백을 포함한 비밀번호를 그대로 저장해야 한다', () => {
      const passwordWithSpaces = '  password123  ';

      const userPassword = UserPassword.from(passwordWithSpaces);

      expect(userPassword.value).toBe('  password123  ');
    });

    it('중간에 공백이 포함된 비밀번호를 허용해야 한다', () => {
      const passwordWithMiddleSpaces = 'my pass word';

      const userPassword = UserPassword.from(passwordWithMiddleSpaces);

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
        const userPassword = UserPassword.from(password);
        expect(userPassword.value).toBe(password);
      });
    });
  });
});
