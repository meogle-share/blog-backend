import 'src/init';
import { CommandFactory } from 'nest-commander';
import { CommandsModule } from './commands/commands.module';
import { appEnv } from '@configs/env';

console.debug(`[ENV] Starting Test in "${appEnv.NODE_ENV}" mode`);

async function bootstrap() {
  await CommandFactory.run(CommandsModule, {
    logger: ['error', 'warn', 'log'],
    errorHandler: (err) => {
      console.error('CLI Error:', err);
      process.exit(1);
    },
  });
}

bootstrap();
