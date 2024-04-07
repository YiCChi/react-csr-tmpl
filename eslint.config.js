// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactRecommend from 'eslint-plugin-react/configs/recommended.js';
import tsEslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compact = new FlatCompat({ baseDirectory: __dirname });

export default tsEslint.config(
  eslint.configs.recommended,
  reactRecommend,
  reactJsxRuntime,
  ...compact.extends('plugin:react-hooks/recommended'),
  { settings: { react: { version: 'detect' } } },
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['lint-staged.config.js', '__tests__', '**/*.js'],
  },
  prettier,
  {
    rules: {
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/prefer-enum-initializers': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // extension rules
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'error',
      'init-declarations': 'off',
      '@typescript-eslint/init-declarations': 'error',
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      'no-invalid-this': 'off',
      '@typescript-eslint/no-invalid-this': 'error',
      'no-loop-func': 'off',
      '@typescript-eslint/no-loop-func': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
    },
  },
);
