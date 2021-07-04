const path = require('path');
const webpack = require('webpack');

const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = [
  {
    entry: ['./assets/js/common-index.js'],
    output: {
      path: path.resolve('./assets/bundles/'),
      filename: 'bundle-common.js',
    },
    name: 'common',
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: [nodeModulesDir],
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: require.resolve('jquery'),
          loader: 'expose-loader',
          options: { exposes: ['$', 'jQuery', 'jquery'] },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
        },
        {
          test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset',
        },
        {
          test: /\.(woff(2)?|eot|ttf)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset',
        },
        {
          test: /\.(jpg|png)?$/,
          // use: ['file-loader?name=i-[contenthash].[ext]'],
          type: 'asset/resource',
          generator: {
            filename: 'i-[contenthash][ext]',
          },
        },
      ],
    },
    plugins: [
      new BundleTracker({
        path: __dirname,
        filename: './assets/bundles/common-webpack-stats.json',
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
    ],
  },
  {
    context: __dirname,
    entry: [
      // defined in local or prod
    ],
    output: {
      // defined in local or prod
    },
    name: 'main',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
        },
        {
          test: /\.(svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset',
        },
        {
          test: /\.(jpg|png)?$/,
          use: ['file-loader?name=i-[contenthash].[ext]'],
        },
      ],
    },
    plugins: [
      // defined in local or prod
    ],
    resolve: {
      modules: [
        'node_modules',
        'bower_components',
        path.resolve(__dirname, 'assets/js/'),
      ],
      extensions: ['.js', '.jsx'],
      alias: {
        'babel-runtime': '@babel/runtime',
      },
    },
  },
];
