import { UserNickName } from './user-nickname';

describe('UserNickName', () => {
  describe('from', () => {
    it('유효한 닉네임으로 UserNickName을 생성해야 한다', () => {
      const nickname = '테스터123';
      const userNickName = UserNickName.from(nickname);

      expect(userNickName).toBeInstanceOf(UserNickName);
      expect(userNickName.value).toBe(nickname);
    });

    it('다양한 형식의 유효한 닉네임을 허용해야 한다', () => {
      const validNicknames = [
        '홍길동', // 한글만
        'JohnDoe', // 영문만
        '123456', // 숫자만
        '테스터123', // 한글+숫자
        'User가나다', // 영문+한글
        'abc123', // 영문+숫자
        '테스터User123', // 한글+영문+숫자
        '가나', // 최소 길이 (2자)
        '가나다라마바사아자차카타파하', // 최대 길이 (15자)
        '홍 길동', // 한글 + 공백
        'John Doe', // 영문 + 공백
        '테스터 123', // 한글 + 공백 + 숫자
        'User 가나다', // 영문 + 공백 + 한글
        '테스터 User 123', // 한글 + 공백 + 영문 + 공백 + 숫자
      ];

      validNicknames.forEach((nickname) => {
        const userNickName = UserNickName.from(nickname);
        expect(userNickName.value).toBe(nickname);
      });
    });

    it('빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => UserNickName.from('')).toThrow('닉네임은 필수입니다');
    });

    it('공백만 있으면 에러를 던져야 한다', () => {
      expect(() => UserNickName.from('   ')).toThrow('닉네임은 필수입니다');
    });

    it('최소 길이보다 짧으면 에러를 던져야 한다', () => {
      const shortNickname = '가';

      expect(() => UserNickName.from(shortNickname)).toThrow(
        `닉네임은 ${UserNickName.MIN_LENGTH}자 이상 ${UserNickName.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('최대 길이보다 길면 에러를 던져야 한다', () => {
      const longNickname = '가'.repeat(16);

      expect(() => UserNickName.from(longNickname)).toThrow(
        `닉네임은 ${UserNickName.MIN_LENGTH}자 이상 ${UserNickName.MAX_LENGTH}자 이하여야 합니다`,
      );
    });

    it('특수문자가 포함되면 에러를 던져야 한다', () => {
      const invalidNicknames = [
        '테스터!', // 느낌표
        '유저@123', // @
        'User#Name', // #
        '닉네임_123', // 언더스코어
        '테스터-123', // 하이픈
        '테스터.123', // 점
        'User&Name', // &
      ];

      invalidNicknames.forEach((nickname) => {
        expect(() => UserNickName.from(nickname)).toThrow(
          '닉네임은 한글, 영문, 숫자와 단어 사이 1개의 공백만 사용할 수 있습니다',
        );
      });
    });

    it('연속된 공백이나 시작/끝 공백이 있으면 에러를 던져야 한다', () => {
      const invalidNicknames = [
        'User  Name', // 연속된 공백
        'User   Name', // 3개 이상의 공백
        '테스터  123', // 연속된 공백
      ];

      invalidNicknames.forEach((nickname) => {
        expect(() => UserNickName.from(nickname)).toThrow(
          '닉네임은 한글, 영문, 숫자와 단어 사이 1개의 공백만 사용할 수 있습니다',
        );
      });
    });

    it('앞뒤 공백을 제거한 후 검증해야 한다', () => {
      const nicknameWithSpaces = '  테스터123  ';

      const userNickName = UserNickName.from(nicknameWithSpaces);

      expect(userNickName.value).toBe('테스터123'); // trim된 값 저장
    });

    it('앞뒤 공백 제거 후 빈 문자열이면 에러를 던져야 한다', () => {
      expect(() => UserNickName.from('   ')).toThrow('닉네임은 필수입니다');
    });

    it('앞뒤 공백 제거 후 길이가 최소 길이보다 짧으면 에러를 던져야 한다', () => {
      const nickname = '  가  '; // trim 후 1자

      expect(() => UserNickName.from(nickname)).toThrow(
        `닉네임은 ${UserNickName.MIN_LENGTH}자 이상 ${UserNickName.MAX_LENGTH}자 이하여야 합니다`,
      );
    });
  });
});
