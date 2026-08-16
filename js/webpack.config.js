const baseConfig = require('flarum-webpack-config')();
const { merge } = require('webpack-merge');

module.exports = (env, argv) => {
  return merge(
    baseConfig,
    /** @type {import('webpack').Configuration} */
    {
      output: {
        clean: {
          keep: 'sw.js',
        },
      },
    }
  );
};
