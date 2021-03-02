const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ESBuildPlugin, ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = (env, argv) => ({
  devtool: 'source-map',
  node: {
    global: true
  },
  module: {
    rules: [
      {
        test: /\.m?js[x]?$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'jsx',
          target: 'es2015'
        }
      },
      {
        test: /\.m?js[x]?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(less|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              url: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: { plugins: [require('autoprefixer')({})] },
              sourceMap: true
            }
          },
          'less-loader'
        ]
      },

      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: 'assets/img/[name].[ext]',
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
              name: 'assets/fonts/[name].[ext]',
              limit: 1024
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015'
      })
    ]
  },
  output: {
    filename: '[name].[contenthash].min.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/ui/'
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!env.js'],
      cleanAfterEveryBuildPatterns: ['!assets/fonts/*', '!assets/img/*']
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      XTERM_VERSION: JSON.stringify(require('./package.json').dependencies.xterm),
      XTERM_FIT_VERSION: JSON.stringify(require('./package.json').dependencies['xterm-addon-fit']),
      XTERM_SEARCH_VERSION: JSON.stringify(require('./package.json').dependencies['xterm-addon-search'])
    }),
    new ESBuildPlugin(),
    new HtmlWebPackPlugin({
      favicon: './src/favicon.ico',
      hash: true,
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  resolve: {
    alias: {
      '@babel/runtime/helpers/esm': path.resolve(__dirname, 'node_modules/@babel/runtime/helpers/esm')
    },
    fallback: {
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      crypto: 'crypto-browserify',
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/')
    }
  },
  target: 'web'
});
