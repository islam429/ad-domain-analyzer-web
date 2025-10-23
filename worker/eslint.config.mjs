import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node }
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      'no-console': 'warn'
    }
  }
])
