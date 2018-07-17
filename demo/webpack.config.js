module.exports = {
  entry: './demo/index.tsx',
  devtool: 'source-map',
  mode: 'development',
  output: {
    filename: './demo/index.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  devServer: {
    contentBase: __dirname,
  },
};
