module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'react-app',
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'plugin:import/recommended',
    'plugin:import/react',
    'plugin:import/typescript',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'react', 'cypress', 'jsdoc', 'import', 'react-hooks'],
  env: { browser: true, node: true, es6: true, jest: true, 'cypress/globals': true },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    jsdoc: { exemptEmptyFunctions: false },
  },
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-unused-vars': 'off',
    'no-console': 'off',
    'react/prop-types': 0,
    '@typescript-eslint/no-unused-vars': 'off', // Use Typescript own check for this
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
    '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-unused-expressions': 'off',
    'prettier/prettier': 'error',
    'require-jsdoc': 1,
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'import/no-unresolved': 'off',
    'import/order': 'error',
    'object-shorthand': 'error',
    'dot-notation': 'error',
    'no-caller': 'error',
    'no-useless-concat': 'error',
    'no-undef': 0, // This is checked by typescript noUnusedLocals option
    radix: 'error',
    yoda: 'error',
    'prefer-arrow-callback': 'error',
    'prefer-rest-params': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'no-shadow': 'error',
    '@typescript-eslint/no-useless-constructor': 'error',
    'prefer-template': 'error',
    'prefer-destructuring': ['error', { array: false, object: true }],
    'default-case': 'error',
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/test/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'dot-notation': 'off',
      },
    },
    {
      files: ['examples/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
      rules: {
        'require-jsdoc': 'off',
      },
    },
  ],
}
