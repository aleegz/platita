const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  globalIgnores(['dist/**', '.expo/**', 'coverage/**']),
  expoConfig,
  {
    files: ['*.{js,cjs,mjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', 'jest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  eslintConfigPrettier,
]);
