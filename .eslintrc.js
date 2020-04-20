module.exports = {
    extends: 'unu',
    rules: {
        'no-console': 'off',
        'max-len': 'off',
        'no-underscore-dangle': ["error", { "allow": ["_id", "_source", "_test"] }],
        'import/no-unresolved': 'off',
        'import/extensions': 'off'
    }
};
