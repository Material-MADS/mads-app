/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
// ________________________________________________________________________________________________
// Authors: Jun Fujima (Former Lead Developer) [2018-2021]
//          Mikael Nicander Kuwahara (Current Lead Developer) [2021-]
// ________________________________________________________________________________________________
// Description: Webpack dev server
// ------------------------------------------------------------------------------------------------
// Notes: This is the development server that runs the main app
// ------------------------------------------------------------------------------------------------
// References: 'NodeJS' platform and 'WebPack' library
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
const path = require('path');

//-------------------------------------------------------------------------------------------------
// Insert the needed modules for the storybook interface
//-------------------------------------------------------------------------------------------------
module.exports = {
  stories: ['../assets/js/app/mads-cmv/components/**/*.stories.@(js|ts)'],
  addons: [
    '@storybook/addon-actions',
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
//-------------------------------------------------------------------------------------------------
