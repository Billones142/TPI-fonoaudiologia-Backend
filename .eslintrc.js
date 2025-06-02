import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      indent: [
        'warn',
        2,
        {
          SwitchCase: 1,
        },
      ],
      'comma-dangle': ['error', 'always-multiline'],
      'no-multiple-empty-lines': [
        'warn',
        {
          max: 2,
        },
      ],
      'no-warning-comments': ['warn'],
    },
  },
); 