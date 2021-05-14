const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const SpritesmithPlugin = require('webpack-spritesmith');
const BundleTracker = require('webpack-bundle-tracker');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const baseConfig = require('./webpack.base.config');

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
  new MiniCssExtractPlugin({
    filename: '[name]-[contenthash].css',
    // disable: false,
    // allChunks: true,
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

module.exports = baseConfig;
