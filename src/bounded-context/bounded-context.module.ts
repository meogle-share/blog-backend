import { Module } from '@nestjs/common';
import { ContentModule } from './content/content.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [ContentModule, IamModule],
})
export class BoundedContextModule {}
