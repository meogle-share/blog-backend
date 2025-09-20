import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './infra/environment/validator';
import { PersistenceModule } from './infra/persistence/persistence.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    ApplicationModule,
    PersistenceModule,
  ],
})
export class AppModule {}
