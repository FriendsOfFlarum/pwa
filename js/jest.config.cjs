const path = require('node:path');
const config = require('@flarum/jest-config')();

module.exports = {
  ...config,
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Transform @flarum/jest-config's TypeScript inside pnpm's package directory.
  transformIgnorePatterns: ['/node_modules/(?!(?:\\.pnpm/|@flarum/jest-config/))'],
  // Let core's source resolve dependencies from @flarum/jest-config's node_modules.
  modulePaths: [...config.modulePaths, path.resolve(path.dirname(require.resolve('@flarum/jest-config')), '../..')],
};
