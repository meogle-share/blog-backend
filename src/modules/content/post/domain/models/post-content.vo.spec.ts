import { PostContent } from './post-content.vo';

describe('PostContent', () => {
  describe('생성 및 검증', () => {
    it('유효한 내용으로 PostContent를 생성해야 한다', () => {
      const validContent = 'This is a valid post content with enough text.';

      const postContent = PostContent.from(validContent);

      expect(postContent).toBeInstanceOf(PostContent);
      expect(postContent.value).toBe(validContent);
    });

    it('최소 길이 내용으로 PostContent를 생성해야 한다', () => {
      const minContent = 'A';

      const postContent = PostContent.from(minContent);

      expect(postContent.value).toBe(minContent);
    });

    it('최대 길이 내용으로 PostContent를 생성해야 한다', () => {
      const maxContent = 'A'.repeat(PostContent.MAX_LENGTH);

      const postContent = PostContent.from(maxContent);

      expect(postContent.value).toBe(maxContent);
    });

    it('빈 문자열 내용은 오류를 발생시켜야 한다', () => {
      const emptyContent = '';

      expect(() => PostContent.from(emptyContent)).toThrow();
    });

    it('최대 길이를 초과하는 내용은 오류를 발생시켜야 한다', () => {
      const tooLongContent = 'A'.repeat(PostContent.MAX_LENGTH + 1);

      expect(() => PostContent.from(tooLongContent)).toThrow(
        `Content must be between ${PostContent.MIN_LENGTH} and ${PostContent.MAX_LENGTH} characters`,
      );
    });
  });

  describe('도메인 특화 케이스', () => {
    it('마크다운 형식의 긴 내용도 생성할 수 있어야 한다', () => {
      const markdownContent = `
        # 제목

        ## 소제목

        본문 내용입니다.

        - 리스트 1
        - 리스트 2
        - 리스트 3

        \`\`\`typescript
        const code = 'example';
        \`\`\`
      `.trim();

      const postContent = PostContent.from(markdownContent);

      expect(postContent.value).toBe(markdownContent);
    });
  });

  describe('ValueObject 동작 확인', () => {
    it('equals 메서드가 정상 동작해야 한다', () => {
      const content1 = PostContent.from('Same Content');
      const content2 = PostContent.from('Same Content');
      const content3 = PostContent.from('Different Content');

      expect(content1.equals(content2)).toBe(true);
      expect(content1.equals(content3)).toBe(false);
    });
  });
});
