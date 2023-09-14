/*=================================================================================================
// Project: CADS/MADS - An Integrated Web-based Visual Platform for Materials Informatics
//          Hokkaido University (2018)
//          Last Update: Q3 2023
// ________________________________________________________________________________________________
// Authors: Mikael Nicander Kuwahara (Lead Developer) [2021-]
//          Jun Fujima (Former Lead Developer) [2018-2021]
// ________________________________________________________________________________________________
=================================================================================================*/

//-------------------------------------------------------------------------------------------------
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    'react-hot-loader/babel',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-transform-runtime',
  ],
};
//-------------------------------------------------------------------------------------------------
