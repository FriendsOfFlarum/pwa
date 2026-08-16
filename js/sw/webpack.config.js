const path = require('node:path');
const baseConfig = require('flarum-webpack-config')();

module.exports = (env, argv) => ({
  name: 'sw',
  mode: argv.mode || 'production',
  target: 'webworker',
  context: __dirname,
  entry: './sw.ts',
  output: {
    filename: 'sw.js',
    path: path.resolve(__dirname, '../dist'),
    clean: false,
  },
  module: baseConfig.module,
  resolve: baseConfig.resolve,
});
