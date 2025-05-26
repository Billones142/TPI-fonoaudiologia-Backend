import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([{
  extends: compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ),

  plugins: {
    '@typescript-eslint': typescriptEslint,
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },

    parser: tsParser,
    ecmaVersion: 'latest',
    sourceType: 'module',

    parserOptions: {
      project: './tsconfig.json',
    },
  },

  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',

    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
    }],

    'no-console': ['warn', {
      allow: ['warn', 'error'],
    }],

    quotes: ['error', 'single'],
    semi: ['error', 'always'],

    indent: ['warn', 2, {
      SwitchCase: 1,
    }],

    'comma-dangle': ['error', 'always-multiline'],

    'no-multiple-empty-lines': ['warn', {
      max: 2,
    }],

    'no-warning-comments': ['warn'],
  },
}]);