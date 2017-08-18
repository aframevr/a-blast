var webpack = require('webpack');

var PLUGINS = [];
if (process.env.NODE_ENV === 'production') {
  PLUGINS.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: 'build/build.js'
  },
  plugins: PLUGINS,
  devServer: {
    disableHostCheck: true
  }
};
