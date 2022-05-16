module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    quotes: ['error', 'single'],
    indent: ['error', 2],
    'no-multi-spaces': ['error'],
    'no-shadow': 'off',
    fallthrough: 'on',
  },
}
