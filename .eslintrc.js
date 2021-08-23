module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    mocha: true,
  },
  extends: [
    'airbnb-base',
  ],
  overrides: [
    {
      files: ['*.spec.js'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-await-in-loop': 'off',
    'max-len': 'off',
  },
};
