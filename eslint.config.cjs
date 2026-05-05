const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const { reactRefresh } = require('eslint-plugin-react-refresh')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ['dist', 'node_modules', 'eslint.config.cjs', 'scripts/**/*.mjs'],
  },
  ...compat.config({
    env: { browser: true, es2021: true },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      project: ['./tsconfig.app.json', './tsconfig.node.json'],
      tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'react-hooks'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  }),
  reactRefresh.configs.vite(),
]
