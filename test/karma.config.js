module.exports = config =>
  config.set({
    frameworks: ['mocha'],
    files: [
      `./karma.shim.js`,
    ],
    preprocessors: {
      "./karma.shim.js": ["webpack", 'sourcemap']
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    reporters: ['mocha'],
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    webpackServer: {
      logLevel: 'error',
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader'
          }
        ]
      }
    }
  });
