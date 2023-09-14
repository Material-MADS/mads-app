/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Storybook main
// ------------------------------------------------------------------------------------------------
// Notes: This is the storybook module
// ------------------------------------------------------------------------------------------------
// References:
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
