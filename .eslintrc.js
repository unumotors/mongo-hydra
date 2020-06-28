module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    // Custom rules for this project
    'require-await': 'error',
    'no-return-await': 'off',
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'max-len': ['error', { code: 160 }]
  }
}
