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
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.local.config';


//-------------------------------------------------------------------------------------------------
// Setup Server environment
//-------------------------------------------------------------------------------------------------
const port = process.env.DEV_SERVER_PORT || 3000;
const devServerPublic = process.env.DEV_SERVER_PUBLIC_ORIGIN || '';


//-------------------------------------------------------------------------------------------------
// Start Server
// (Ignore the deprecation warning regarding 'listen' in VSCode, it makes no sense and has no
// online explanation)
//-------------------------------------------------------------------------------------------------
new WebpackDevServer(webpack(config), {
  publicPath: config[1].output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  port,
  public: devServerPublic,
}).listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
  }

  console.log(`Listening at 0.0.0.0:${port}`);
  console.log('publicPath:', config[1].output.publicPath);
});
//-------------------------------------------------------------------------------------------------
