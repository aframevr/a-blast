var webpack = require('webpack');

var PLUGINS = [];
if (process.env.NODE_ENV === 'production') {
  new webpack.optimize.UglifyJsPlugin()
}

module.exports = {
  devServer: {port: 8080},
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: 'build/build.js'
  },
  plugins: PLUGINS
};
