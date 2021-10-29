const path = require('path');

module.exports = {
  stories: ['../assets/js/app/mads-cmv/components/**/*.stories.@(js|ts)'],
  addons: [
    '@storybook/addon-actions',
    // '@storybook/addon-docs',
    '@storybook/addon-controls',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],

  webpackFinal: async (config, { configType }) => {
    config.resolve.alias = {
      'babel-runtime': '@babel/runtime',
      '@vendors': path.resolve('assets/vendors/'),
    };

    config.module.rules.push({
      test: /\.jsx?$/,
      exclude: /node_modules\/(?!@bokeh\/bokehjs\/)/,
      loader: require.resolve('babel-loader'),
    });

    // Return the altered config
    return config;
  },
};
