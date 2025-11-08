import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  rootDir: '..',
  moduleNameMapper: {
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@test$': '<rootDir>/test',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!uuid)'],
  verbose: true,
};

export default config;
