import type { Config } from 'jest';
import baseConfig from './test/jest.config.base';

const config: Config = {
  ...baseConfig,
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
};

export default config;