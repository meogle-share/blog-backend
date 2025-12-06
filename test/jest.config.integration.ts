import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['**/*.integration.spec.ts'],
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/setup/global-teardown.ts',
  // todo: 병렬 테스트 지원
  maxWorkers: 1,
};

export default config;
