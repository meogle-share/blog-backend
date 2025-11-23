import * as dotenv from 'dotenv';
import * as path from 'path';
import { NodeEnvironment, validate } from '@configs/env.validator';

const getEnvFile = (): string => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case NodeEnvironment.DEVELOPMENT:
      return '.env.dev';
    case NodeEnvironment.TEST:
      return '.env.test';
    case NodeEnvironment.LOAD_TEST:
      return '.env.test.load';
    case NodeEnvironment.MIGRATION:
      return '.env.migration';
    default:
      return '.env';
  }
};

dotenv.config({
  path: path.resolve(process.cwd(), getEnvFile()),
});
const appEnv = validate(process.env);

/**
 * 애플리케이션 환경 변수 appEnv 사용 (validation, 타입 변경 등)
 * process.env 지양
 */
export { appEnv };
