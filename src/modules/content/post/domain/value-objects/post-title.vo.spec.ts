import { PostTitle } from './post-title.vo';

describe('PostTitle', () => {
  describe('생성 및 검증', () => {
    it('유효한 제목으로 PostTitle을 생성해야 한다', () => {
      const validTitle = 'Valid Post Title';

      const postTitle = PostTitle.from(validTitle);

      expect(postTitle).toBeInstanceOf(PostTitle);
      expect(postTitle.value).toBe(validTitle);
    });

    it('최소 길이 제목으로 PostTitle을 생성해야 한다', () => {
      const minTitle = 'A';

      const postTitle = PostTitle.from(minTitle);

      expect(postTitle.value).toBe(minTitle);
    });

    it('최대 길이 제목으로 PostTitle을 생성해야 한다', () => {
      const maxTitle = 'A'.repeat(PostTitle.MAX_LENGTH);

      const postTitle = PostTitle.from(maxTitle);

      expect(postTitle.value).toBe(maxTitle);
    });

    it('빈 문자열 제목은 오류를 발생시켜야 한다', () => {
      const emptyTitle = '';

      expect(() => PostTitle.from(emptyTitle)).toThrow();
    });

    it('최대 길이를 초과하는 제목은 오류를 발생시켜야 한다', () => {
      const tooLongTitle = 'A'.repeat(PostTitle.MAX_LENGTH + 1);

      expect(() => PostTitle.from(tooLongTitle)).toThrow(
        `Content must be between ${PostTitle.MIN_LENGTH} and ${PostTitle.MAX_LENGTH} characters`,
      );
    });
  });

  describe('ValueObject 동작 확인', () => {
    it('equals 메서드가 정상 동작해야 한다', () => {
      const title1 = PostTitle.from('Same Title');
      const title2 = PostTitle.from('Same Title');
      const title3 = PostTitle.from('Different Title');

      expect(title1.equals(title2)).toBe(true);
      expect(title1.equals(title3)).toBe(false);
    });
  });
});
