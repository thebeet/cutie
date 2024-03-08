/* eslint-env node */
module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'plugin:vue/vue3-strongly-recommended',
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting'
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'indent': ['warn', 4],
        'no-trailing-spaces': ['warn', { 'ignoreComments': true }],
        'no-console': 'warn',
        'eqeqeq': 'error',
        'keyword-spacing': 'warn',
        'key-spacing': ['warn', { 'beforeColon': false, 'afterColon': true }],
        'space-infix-ops': ['error', { 'int32Hint': false }],
        'arrow-spacing': 'warn',
        'comma-spacing': 'warn',
        'array-bracket-spacing': 'warn',
        'object-curly-spacing': ['warn', 'always'],
        'vue/html-closing-bracket-spacing': ['warn', {
            'selfClosingTag': 'never'
        }],
        'vue/attributes-order': ['warn'],
        'vue/first-attribute-linebreak': ['warn', {
            'singleline': 'ignore',
            'multiline': 'below'
        }],
        'vue/html-indent': ['warn', 4, {
            'attribute': 1,
            'baseIndent': 1,
            'closeBracket': 0,
            'alignAttributesVertically': true,
            'ignores': []
        }],
        'vue/script-indent': ['warn', 4, {
            'baseIndent': 0,
            'switchCase': 0,
            'ignores': []
        }],
        'vue/max-attributes-per-line': ['error', {
            'singleline': 3,
            'multiline': {
                'max': 1
            }
        }],
        'vue/html-closing-bracket-newline': ['error', {
            'singleline': 'never',
            'multiline': 'always'
        }]
    },
};