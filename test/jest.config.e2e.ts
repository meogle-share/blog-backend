import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'e2e',
  rootDir: '..',
  testMatch: ['**/test/**/*.e2e.spec.ts'],
  testTimeout: 30000,
};

export default config;
