import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'docs', 'data', '**/dist'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    // A noUncheckedIndexedAccess mellett az ellenőrzött indexelés után a `!` a szokásos minta.
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
);
