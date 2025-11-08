import { PostId } from './post-id';

describe('PostId', () => {
  describe('generate', () => {
    it('UUID 형식의 PostId를 생성해야 한다', () => {
      const postId = PostId.generate();

      expect(postId).toBeInstanceOf(PostId);
      expect(postId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('매번 다른 UUID를 생성해야 한다', () => {
      const postId1 = PostId.generate();
      const postId2 = PostId.generate();

      expect(postId1.value).not.toBe(postId2.value);
    });
  });

  describe('from', () => {
    it('주어진 문자열로 PostId를 생성해야 한다', () => {
      const idValue = '01912345-6789-7abc-8888-123456789abc';

      const postId = PostId.from(idValue);

      expect(postId).toBeInstanceOf(PostId);
      expect(postId.value).toBe(idValue);
    });

    it('유효한 UUID v7 형식이어야 한다', () => {
      const idValue = '01912345-6789-7abc-9999-123456789def';

      const postId = PostId.from(idValue);

      expect(postId.value).toBe(idValue);
    });
  });
});
