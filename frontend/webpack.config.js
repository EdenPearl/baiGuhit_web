const path = require('path');

module.exports = {
  entry: './src/index.js', // Specify the entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output file name
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/, // Exclude the node_modules directory
        use: 'babel-loader', // Use babel-loader to transpile JavaScript files
      },
    ],
  },
  resolve: {
    fallback: {
      assert: require.resolve('assert/'), // Polyfill for the assert module
      url: require.resolve('url/'), // Polyfill for the url module
    },
  },
};
