import { UserName } from './user-name';

describe('UserName', () => {
  describe('from', () => {
    it('유효한 이메일로 UserName을 생성해야 한다', () => {
      const email = 'user@example.com';

      const userName = UserName.from(email);

      expect(userName).toBeInstanceOf(UserName);
      expect(userName.value).toBe(email);
    });

    it('다양한 형식의 유효한 이메일을 허용해야 한다', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.kr',
        'user_name@sub.example.com',
        'user123@test-domain.com',
        'a@b.c', // 최소 길이
      ];

      validEmails.forEach((email) => {
        const userName = UserName.from(email);
        expect(userName.value).toBe(email);
      });
    });

    it('빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => UserName.from('')).toThrow('이메일은 필수입니다');
    });

    it('공백만 있으면 에러를 던져야 한다', () => {
      expect(() => UserName.from('   ')).toThrow(
        '값의 길이를 확인할 수 없습니다. 값이 비어있습니다',
      );
    });

    it('최소 길이보다 짧으면 에러를 던져야 한다', () => {
      const shortEmail = 'a@b';

      expect(() => UserName.from(shortEmail)).toThrow(
        `아이디(이메일)는 ${UserName.MIN_LENGTH}자 이상 ${UserName.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('최대 길이보다 길면 에러를 던져야 한다', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';

      expect(() => UserName.from(longEmail)).toThrow(
        `아이디(이메일)는 ${UserName.MIN_LENGTH}자 이상 ${UserName.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('올바르지 않은 이메일 형식이면 에러를 던져야 한다', () => {
      const invalidEmails = ['notanemail', '@example.com', 'user@', 'user @example.com'];

      invalidEmails.forEach((email) => {
        expect(() => UserName.from(email)).toThrow('올바른 이메일 형식이 아닙니다');
      });
    });

    it('앞뒤 공백을 제거한 후 검증해야 한다', () => {
      const emailWithSpaces = '  user@example.com  ';

      const userName = UserName.from(emailWithSpaces);

      expect(userName.value).toBe(emailWithSpaces); // 원본 값 유지
    });
  });
});
