import js from '@eslint/js'
import globals from 'globals'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y-x'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintReact.configs['recommended-typescript'],
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
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-constant-binary-expression': 'off',

      // Children.map / cloneElement / Children.toArray are how this library
      // works: it takes <Tab> elements as children, reads their props and
      // clones them with the wiring they need. The rule is sound advice for
      // application code and inapplicable to a component library built on
      // children introspection.
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-clone-element': 'off',

      // forwardRef is unnecessary in React 19, but peerDependencies still
      // declare ^17 || ^18 || ^19. Passing ref as a plain prop would break
      // every consumer below 19. Revisit when the peer range drops <19.
      '@eslint-react/no-forward-ref': 'off',

      // Assumes useRef holds a DOM ref. Ours hold a timer handle, a focus
      // index and an array of nodes — 'timeoutId' and 'tabRefs' are the
      // accurate names, and the rule's suffix requirement makes them worse.
      '@eslint-react/naming-convention-ref-name': 'off',

      // False positive: useState is already destructured, the rule just
      // doesn't recognise a destructuring pattern in the value position
      // (`const [{ index, name }, setSelected] = useState(...)`).
      '@eslint-react/use-state': 'off',
    },
  },
)
