import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'e2e',
  rootDir: '../src',
  testRegex: '.*\\.e2e-spec\\.ts$',
};

export default config;
