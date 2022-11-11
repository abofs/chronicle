module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  globals: {
    Parallel: 'readonly',
    require: 'readonly',
    module: 'readonly',
  },
  env: { browser: true },
  rules: {
    indent: ['error', 2],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'eol-last': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-alert': 'error',
    'key-spacing': ['error', {
      beforeColon: false,
      afterColon: true,
    }],
    'keyword-spacing': 'error',
    'linebreak-style': ['error', 'unix'],
    'lines-around-comment': ['error', {
      beforeBlockComment: true,
      afterBlockComment: false,
      beforeLineComment: true,
      afterLineComment: false,
      allowBlockStart: true,
      allowClassStart: true,
      allowObjectStart: true,
      allowArrayStart: true,
    }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'multiline-comment-style': ['error', 'starred-block'],
    'no-lonely-if': 'error',
    'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
    'no-multiple-empty-lines': ['error', {
      max: 2,
      maxEOF: 1,
    }],
    'no-trailing-spaces': 'error',
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],
    'no-whitespace-before-property': 'error',
    'nonblock-statement-body-position': ['error', 'beside', { overrides: { while: 'below' }}],
    'object-curly-newline': ['error', { multiline: true }],
    'object-curly-spacing': ['error', 'always', {
      objectsInObjects: false,
      arraysInObjects: false,
    }],
    'object-property-newline': 'error',
    'operator-assignment': ['error', 'always'],
    'padding-line-between-statements': ['error', {
      blankLine: 'always',
      prev: '*',
      next: 'return',
    }],
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true,
    }],
    semi: ['error', 'always'],
    'semi-spacing': 'error',
    'semi-style': ['error', 'last'],
    'space-before-blocks': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', {
      words: true,
      nonwords: false,
    }],
    'spaced-comment': ['error', 'always'],
    'switch-colon-spacing': 'error',
    'template-tag-spacing': ['error', 'always'],
    'wrap-regex': 'error',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-spacing': 'error',
    'generator-star-spacing': ['error', {
      before: true,
      after: false,
    }],
    'no-console': ['error', { allow: ['warn', 'error']}],
    'no-case-declarations': 'off',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'yield-star-spacing': 'error',
  },
  overrides: [
    {
      files: [
        '.eslintrc.js',
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2018,
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, { 'node/no-unpublished-require': 'off' }),
    },
  ],
};