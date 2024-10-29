/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage'],
  },
  eslint.configs.recommended,
  unicorn.configs['flat/all'],
  sonarjs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.builtin,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'no-var': 'error',
      semi: 'error',
      'no-multi-spaces': 'error',
      'no-empty-function': 'error',
      'no-floating-decimal': 'error',
      'no-implied-eval': 'error',
      'no-lone-blocks': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-new': 'error',
      'no-octal-escape': 'error',
      'no-return-await': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'space-in-parens': 'error',
      'no-multiple-empty-lines': 'error',
      'no-unsafe-negation': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'sonarjs/sonar-no-unused-vars': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/catch-error-name': 'off',

      // duplicates of tseslint
      'sonarjs/no-misused-promises': 'off',
      'sonarjs/sonar-prefer-optional-chain': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'sonarjs/no-redundant-type-constituents': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
