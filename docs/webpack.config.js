const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

module.exports = {
  entry: './docs/index.tsx',
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, '..', 'dist', 'docs'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.woff', '.woff2'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        sideEffects: true,
        include: resolve(__dirname, 'index.scss'),
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        sideEffects: true,
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.component.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[local]__[hash:base64:5]',
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|woff|woff2)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    disableHostCheck: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Arcade Machine Documentation',
    }),
  ],
};
