import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['**/*.spec.ts', '!**/*.integration.spec.ts', '!**/*.e2e.spec.ts'],
};

export default config;
