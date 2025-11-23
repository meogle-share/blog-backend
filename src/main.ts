import './init';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp, setupSwagger } from './app.setup';
import { appEnv } from '@configs/env';

console.debug(`[ENV] Starting App in "${appEnv.NODE_ENV}" mode`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  setupSwagger(app);
  await app.listen(3001);
  return app;
}

void bootstrap();
