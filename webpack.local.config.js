const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const SpritesmithPlugin = require('webpack-spritesmith');
const BundleTracker = require('webpack-bundle-tracker');
const path = require('path');
const baseConfig = require('./webpack.base.config');

console.log(baseConfig);

baseConfig[0].mode = 'development';
baseConfig[1].mode = 'development';

const serverAddr = process.env.DEV_SERVER_PUBLIC_ADDR || 'http://localhost';
const serverPort = process.env.DEV_SERVER_PORT || 3000;

// sourcemap
baseConfig[0].devtool = 'inline-source-map';
baseConfig[1].devtool = 'inline-source-map';

baseConfig[1].entry = [
  `webpack-dev-server/client?${serverAddr}:${serverPort}`,
  'webpack/hot/only-dev-server',
  'whatwg-fetch',
  './assets/js/index',
];

baseConfig[0].output.publicPath = `${serverAddr}:${serverPort}/assets/bundles/`;
baseConfig[1].output = {
  path: path.resolve('./assets/bundles/'),
  publicPath: `${serverAddr}:${serverPort}/assets/bundles/`,
  filename: '[name].js',
};

baseConfig[1].module.rules.push(
  {
    test: /\.jsx?$/,
    exclude: /node_modules\/(?!@bokeh\/bokehjs\/)/,
    loader: require.resolve('babel-loader'),
  },
  {
    test: /\.(woff(2)?|eot|ttf)(\?v=\d+\.\d+\.\d+)?$/,
    type: 'asset',
  },
  {
    test: require.resolve('jquery'),
    loader: 'expose-loader',
    options: { exposes: ['$', 'jQuery', 'jquery'] },
  }
);

baseConfig[1].plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new SpritesmithPlugin({
    src: {
      cwd: path.resolve(__dirname, 'assets/images/'),
      glob: '*.png',
    },
    target: {
      image: path.resolve(
        __dirname,
        'assets/images/spritesmith-generated/sprite.png'
      ),
      css: path.resolve(__dirname, 'assets/sass/vendor/spritesmith.scss'),
    },
    retina: '@2x',
  }),
  new BundleTracker({
    filename: './webpack-stats.json',
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

// baseConfig[1].optimization = {
//   splitChunks: { chunks: 'all' },
// };

// baseConfig[1].node = {
//   Buffer: false,
//   process: false,
// };

module.exports = baseConfig;
