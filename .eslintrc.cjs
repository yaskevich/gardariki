module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'import/extensions': ['error', 'ignorePackages'],
    'import/no-extraneous-dependencies': 'off',
    'comma-dangle': 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
  },
};
