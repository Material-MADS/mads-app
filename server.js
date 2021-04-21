// Webpack dev server
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.local.config';

const port = process.env.DEV_SERVER_PORT || 3000;
const devServerPublic = process.env.DEV_SERVER_PUBLIC_ORIGIN || '';

new WebpackDevServer(webpack(config), {
  publicPath: config[1].output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  // disableHostCheck: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Headers': '*',
    //   'Access-Control-Allow-Methods': '*',
  },
  port,
  public: devServerPublic,
}).listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.log(`Listening at 0.0.0.0:${port}`);
  console.log('publicPath:', config[1].output.publicPath);
});
