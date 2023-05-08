/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018-)
//          Last Update: Q2 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
// Description: Settings for webpacks static module bundler for this app if in production mode
// ------------------------------------------------------------------------------------------------
// Notes: This is the additional settings config used by production deployments
// ------------------------------------------------------------------------------------------------
// References: 'webpack.base.config' and some additional external libraries
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
// Load required libraries
//-------------------------------------------------------------------------------------------------
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseConfig = require('./webpack.base.config');

//-------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// Add and change the various configs according to the need of this deployment mode
//-------------------------------------------------------------------------------------------------
baseConfig[0].mode = 'production';
baseConfig[1].mode = 'production';

baseConfig[1].entry = ['whatwg-fetch', './assets/js/index.js'];

baseConfig[0].output.publicPath = '/static/bundles/';
baseConfig[1].output = {
  path: path.resolve('./assets/bundles/'),
  publicPath: '/static/bundles/',
  filename: '[name]-[contenthash].js',
};

baseConfig[1].module.rules.push(
  {
    test: /\.jsx?$/,
    exclude: /node_modules\/(?!@bokeh\/bokehjs\/)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', '@babel/preset-react'],
      },
    },
  },
  {
    test: /\.(woff(2)?|eot|ttf)(\?v=\d+\.\d+\.\d+)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name][ext]',
    },
  },
  {
    test: require.resolve('jquery'),
    loader: 'expose-loader',
    options: { exposes: ['$', 'jQuery', 'jquery'] },
  }
);

baseConfig[1].optimization = { minimize: true };

baseConfig[1].plugins = [
  new webpack.DefinePlugin({
    // removes React warnings
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  new MiniCssExtractPlugin({
    filename: '[name]-[contenthash].css',
  }),
  new BundleTracker({
    path: __dirname,
    filename: './assets/bundles/webpack-stats.json',
  }),
  new webpack.LoaderOptionsPlugin({
    options: {
      context: __dirname,
      postcss: [autoprefixer],
    },
  }),
  new webpack.ProvidePlugin({
    Tether: 'tether',
    'window.Tether': 'tether',
    Popper: ['popper.js', 'default'],
    process: 'process/browser',
    Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
    Button: 'exports-loader?Button!bootstrap/js/dist/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
    Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
    Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
    Tooltip: 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/dist/util',
  }),
];

module.exports = baseConfig;
