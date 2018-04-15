const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = env => {
  var production = env && env.production ? true : false;

  return {
    mode: production ? 'production' : 'development',
    devtool: production ? false : 'source-map',
    entry: {
      bundle: './src/Game.ts'
    },
    output: {
      path: path.join(__dirname, 'public', 'dist'),
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    plugins: production ? [
      new UglifyJSPlugin({
        sourceMap: true,
        extractComments: true
      }),
    ] : [ ],
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
      ]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all"
          }
        }
      }
    }
  };
}
