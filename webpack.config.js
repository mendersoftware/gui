const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader', options: { minimize: true, root: path.resolve(__dirname) } }]
      },
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: './assets/img/[name].[ext]',
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: './assets/fonts/[name].[ext]',
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(less|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [require('autoprefixer')({})],
              minimize: true,
              sourceMap: true
            }
          },
          'resolve-url-loader',
          'less-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new CopyPlugin([{ from: './src/assets/img', to: 'assets/img' }]),
    new CopyPlugin([{ from: './src/*.*', to: '[name].[ext]', test: /(.*)\.(css|ico)$/ }])
  ]
};
