import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { setupApp, setupSwagger } from './app.setup';
import { appEnv } from '@configs/env';

console.debug(`[ENV] Starting App in "${appEnv.NODE_ENV}" mode`);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  setupApp(app);
  setupSwagger(app);
  await app.listen(3001);
  return app;
}

void bootstrap();
