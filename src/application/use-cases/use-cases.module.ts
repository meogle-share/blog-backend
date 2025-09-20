import { Module } from '@nestjs/common';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [],
  exports: [],
})
export class UseCasesModule {}
