import { Config } from '@jest/types';

const infraTestDir = '<rootDir>/test/infra';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    `${infraTestDir}/**/*.test.ts`,
  ],
}

export default config;