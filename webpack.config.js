const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');

module.exports = {
  module: {
    rules: [
      // {
      //   test: /\.js[x]?$/,
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   exclude: /node_modules/,
      //   options: {
      //     emitWarning: true,
      //     configFile: './.eslintrc'
      //   }
      // },
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
              autoprefixer: {
                browsers: ['last 2 versions']
              },
              plugins: () => [autoprefixer],
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
