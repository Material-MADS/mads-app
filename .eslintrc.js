const path = require('path');

module.exports = {
  parser: 'babel-eslint',
  extends: [
    // 'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/react',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'jsx-a11y/': 0,
    'react/jsx-filename-extension': 0,
    // 'import/no-extraneous-dependencies': [
    //   'error',
    //   {
    //     devDependencies: ['**/*.spec.js', '**/*.stories.js', '**/*.config.js'],
    //     peerDependencies: false,
    //   },
    // ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, '/webpack.local.config.js'),
        'config-index': 1,
      },
    },
  },
  globals: {
    Urls: false,
    coreapi: false,
    $: false,
  },
  plugins: ['babel', 'react', 'react-hooks'],
};
