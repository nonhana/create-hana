import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const eslintGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    const eslintDeps: Record<string, string> = {
      'eslint': '^9.0.0',
      'globals': '^15.0.0',
      '@stylistic/eslint-plugin': '^1.0.0',
      'eslint-plugin-import': '^2.29.0',
      'eslint-plugin-unicorn': '^46.0.0',
      'eslint-plugin-promise': '^6.1.1',
    }

    if (language === 'typescript') {
      eslintDeps['typescript-eslint'] = '^8.0.0'
    }

    addDependencies(context.packageJson, eslintDeps, 'devDependencies')

    const lintPattern = language === 'typescript' ? 'src/**/*.{ts,tsx}' : 'src/**/*.{js,jsx}'
    addScripts(context.packageJson, {
      'lint': `eslint ${lintPattern}`,
      'lint:fix': `eslint ${lintPattern} --fix`,
    })

    const eslintConfig = generateESLintConfig(language)
    context.files['eslint.config.mjs'] = eslintConfig

    if (context.config.codeQualityConfig) {
      const eslintVscodeConfig = generateESlintVscodeConfig()
      context.files['.vscode/settings.json'] = eslintVscodeConfig
    }
  },
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'

export default tseslint.config(
  // Global ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,ts,cjs}',
      'coverage/**',
      '*.d.ts',
    ],
  },

  // 1. Base configuration
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked, // Use the strictest type checking rule set
  ...importPlugin.configs.typescript,
  unicornPlugin.configs['flat/recommended'],
  promisePlugin.configs['flat/recommended'],

  // 2. Code style configuration (using @stylistic/eslint-plugin)
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false, // Node.js projects typically don't use JSX
  }),

  // 3. Main rule configuration
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Override and custom rules ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',

      // --- TypeScript rules ---
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      
      // --- Import plugin rules ---
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true },
      }],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unresolved': 'off', // TypeScript compiler handles this

      // --- Unicorn plugin rules (useful additions) ---
      'unicorn/prevent-abbreviations': 'off', // Sometimes abbreviations are conventional
      'unicorn/filename-case': ['error', { case: 'kebabCase' }], // Use kebab-case for filenames
      
      // Disable rules that conflict with @typescript-eslint
      'no-unused-vars': 'off',
    },
  },

  // 4. Disable type checking for JS files
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
)
`
  }
  else {
    return `// @ts-check
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  // 1. Global ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,cjs}',
      'coverage/**',
    ],
  },

  // 2. Base configuration
  js.configs.recommended,

  // 3. Plugin configuration
  importPlugin.configs.recommended,
  unicornPlugin.configs['flat/recommended'],
  promisePlugin.configs['flat/recommended'],

  // 4. Code style configuration (using @stylistic/eslint-plugin)
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
  }),

  // 5. Main rule configuration
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // --- Override and custom rules ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',

      // --- Import plugin rules ---
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',

      // --- Unicorn plugin rules (useful additions) ---
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
]
`
  }
}

function generateESlintVscodeConfig() {
  const config = {
    'editor.formatOnSave': false,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
      'source.organizeImports': 'never',
    },
    'prettier.enable': false,
    '[typescript]': {
      'editor.defaultFormatter': null,
    },
    '[javascript]': {
      'editor.defaultFormatter': null,
    },
    'eslint.rules.customizations': [
      { rule: '@stylistic/*', severity: 'off' },
      { rule: '*-indent', severity: 'off' },
      { rule: '*-spacing', severity: 'off' },
      { rule: '*-spaces', severity: 'off' },
      { rule: '*-order', severity: 'off' },
      { rule: '*-dangle', severity: 'off' },
      { rule: '*-newline', severity: 'off' },
      { rule: '*-multiline', severity: 'off' },
      { rule: '*quotes', severity: 'off' },
      { rule: '*semi', severity: 'off' },
    ],
    'eslint.validate': [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'json',
      'jsonc',
      'yaml',
      'markdown',
    ],
  }

  return JSON.stringify(config, null, 2)
}
