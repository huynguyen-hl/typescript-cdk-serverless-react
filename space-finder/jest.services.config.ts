import { Config } from '@jest/types';

const servicesTestDir = '<rootDir>/test/services';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    `${servicesTestDir}/**/*.test.ts`,
  ],
}

export default config;