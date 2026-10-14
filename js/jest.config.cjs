const path = require('node:path');
const config = require('@flarum/jest-config')();

module.exports = {
  ...config,
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // pnpm keeps packages under node_modules/.pnpm and doesn't hoist their dependencies: let
  // @flarum/jest-config's TypeScript be transformed there, and let core's source find the
  // dependencies it brings (clsx, focus-trap, ...) beside it.
  transformIgnorePatterns: ['/node_modules/(?!(?:\\.pnpm/|@flarum/jest-config/))'],
  modulePaths: [...config.modulePaths, path.resolve(path.dirname(require.resolve('@flarum/jest-config')), '../..')],
};
