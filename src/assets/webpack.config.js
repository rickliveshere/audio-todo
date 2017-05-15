var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  devServer: { 
      inline: true,
      contentBase: path.join(__dirname, "src"),
  },
  entry: {
      index: './src/js/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name]_bundle.js'
  },
  module: {
    rules: [
      { test: /\.(js)$/, use: 'babel-loader', exclude: [path.resolve(__dirname, "node_modules")] },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ]}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: '../ReactDemo.Web/Views/Shared/_Layout.cshtml'
    }),
    new webpack.DefinePlugin({
        "process.env": {
            BROWSER: JSON.stringify(true)
        }
    })
  ]
};