export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@netcode/shared$': '<rootDir>/../../packages/shared/dist/cjs/index.js',
    '^@netcode/shared/(.*)$': '<rootDir>/../../packages/shared/dist/cjs/$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
};
