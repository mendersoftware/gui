const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
  const devPlugins = argv.mode === 'production' ? [] : [new ESLintPlugin()];
  return {
    devtool: 'source-map',
    node: {
      global: true
    },
    module: {
      rules: [
        {
          test: /\.m?js[x]?$/,
          exclude: [/node_modules/, /\.test\./, /__snapshots__/],
          loader: 'esbuild-loader',
          options: {
            loader: 'jsx',
            target: 'es2015'
          }
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
          test: /\.(png|jpe?g|gif|eot|ttf|woff|woff2)$/i,
          exclude: [/node_modules/, /\.test\./, /__snapshots__/],
          type: 'asset'
        },
        {
          test: /\.svg$/i,
          exclude: [/node_modules/, /\.test\./, /__snapshots__/],
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack']
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
      hashFunction: 'xxhash64',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/ui/'
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['**/*', '!env.js'],
        cleanAfterEveryBuildPatterns: ['!assets/fonts/*', '!assets/img/*']
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'node_modules/monaco-editor/min/vs/', to: 'vs' },
          argv.mode !== 'production' && { from: 'node_modules/monaco-editor/min-maps/vs/', to: 'min-maps/vs' }
        ].filter(Boolean)
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      new webpack.DefinePlugin({
        ENV: JSON.stringify(argv.mode),
        XTERM_VERSION: JSON.stringify(require('./package.json').dependencies.xterm),
        XTERM_FIT_VERSION: JSON.stringify(require('./package.json').dependencies['xterm-addon-fit']),
        XTERM_SEARCH_VERSION: JSON.stringify(require('./package.json').dependencies['xterm-addon-search'])
      }),
      new HtmlWebPackPlugin({
        favicon: './src/favicon.svg',
        hash: true,
        template: './src/index.html'
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      ...devPlugins
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
  };
};
