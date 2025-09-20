import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { DatabaseModule } from './infra/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './infra/environment/validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ApplicationModule,
  ],
  providers: [],
})
export class AppModule {}
