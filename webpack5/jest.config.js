const path = require('path');
module.exports = {
  roots: ['<rootDir>/test'],
  testRegex: 'test/(.+)\\.test\\.(jsx?|tsx?)$',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: [path.resolve(__dirname, './setupEnzyme.ts')],
  testEnvironment: 'enzyme',
};
