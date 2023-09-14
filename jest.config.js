'use strict';
/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
=================================================================================================*/


//-------------------------------------------------------------------------------------------------
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
    '^babel-runtime(.*)$': '@babel/runtime/$1',
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
//-------------------------------------------------------------------------------------------------
