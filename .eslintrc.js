module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        sourceType: 'module',
        ecmaVersion: 8,
        ecmaFeatures: {
          'jsx': true
        }
    },
    rules: {
        'prettier/prettier': [
          'error',
          {
            endOfLine: 'auto',
          },
        ],
      },
      plugins: ['prettier'],
}
