'use strict';

module.exports = {
  roots: ['assets/js'],
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@bokeh/bokehjs/)/',
    'staticfiles',
  ],
  modulePaths: ['assets', 'assets/js', 'assets/js/app'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupFiles: ['./jest-setup.js'],
  collectCoverageFrom: ['assets/js/**/*.{js,jsx}'],
  coveragePathIgnorePatterns: [
    'assets/js/store.js',
    'assets/js/index.js',
    'assets/js/jquery-index.js',
    'assets/js/constants/*',
    'assets/js/pages/*',
    'assets/js/tests/*',
  ],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    'staticfiles/',
    // '<root>/staticfiles/',
  ],
  unmockedModulePathPatterns: ['staticfiles/'],

  coverageThreshold: {
    global: {
      statements: 10,
    },
  },
};
