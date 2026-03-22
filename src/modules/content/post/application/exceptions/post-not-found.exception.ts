import { ApplicationException } from '@libs/exceptions';
import { ContentErrorCode } from '@modules/content/error-codes';

export class PostNotFoundException extends ApplicationException {
  constructor(postId?: string) {
    super({
      code: ContentErrorCode.POST_NOT_FOUND,
      message: postId ? `Post not found: ${postId}` : 'Post not found',
    });
  }
}
