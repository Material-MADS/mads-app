module.exports = ({ config }) => {
  config.resolve.alias = {
    'babel-runtime': '@babel/runtime',
  };

  config.module.rules.push({
    test: /\.jsx?$/,
    exclude: /node_modules\/(?!@bokeh\/bokehjs\/)/,
    loader: require.resolve('babel-loader'),
  });

  return config;
};
