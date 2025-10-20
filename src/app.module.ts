import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './infrastructure/environment/validator';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { BoundedContextModule } from './bounded-context/bounded-context.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    BoundedContextModule,
    PersistenceModule,
  ],
})
export class AppModule {}
