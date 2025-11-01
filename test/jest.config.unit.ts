import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
  ...baseConfig,
  displayName: 'unit',
  rootDir: '../src',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['.*\\.int-spec\\.ts$', '.*\\.e2e-spec\\.ts$'],
};

export default config;
