import { Module } from '@nestjs/common';
import { PostModule } from '@modules/content/post/post.module';

@Module({
  imports: [PostModule],
})
export class ContentModule {}
