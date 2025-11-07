import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['**/*.integration.spec.ts'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/test/setup/setup-env.ts'],
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
};

export default config;
