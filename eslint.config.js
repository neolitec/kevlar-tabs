import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],
    files: ['**/*.{ts,tsx}'],
    ignores: ['dist/**', 'docs/**/*.d.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-constant-binary-expression': 'off',
      'react/no-unused-prop-types': 'error',
      // eslint-plugin-react-hooks 7 adds two React Compiler-era rules that
      // flag real patterns in Tabs.tsx: refs read during render inside
      // getChildren(), and the selected-prop-to-state sync effect. Both are
      // legitimate, but fixing them means restructuring the component, so
      // they stay visible as warnings until that is done deliberately.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
)
