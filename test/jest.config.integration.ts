import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'integration',
  rootDir: '../src',
  testRegex: '.*\\.int-spec\\.ts$',
  testTimeout: 30000,
};

export default config;
