import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateReactESLintConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const commonDeps: Record<string, string> = {
    'eslint': '^9.30.1',
    '@eslint/js': '^9.30.1',
    'eslint-plugin-react': '^7.37.5',
    'eslint-plugin-react-hooks': '^5.2.0',
    'eslint-plugin-react-refresh': '^0.4.20',
    'eslint-plugin-simple-import-sort': '^12.1.1',
    'eslint-plugin-jsonc': '^2.20.1',
    'eslint-plugin-yml': '^1.18.0',
    'typescript-eslint': '^8.36.0',
    '@eslint/markdown': '^6.6.0',
  }

  let eslintDeps: Record<string, string>

  if (language === 'typescript') {
    eslintDeps = { ...commonDeps }
  }
  else {
    eslintDeps = { ...commonDeps, globals: '^16.3.0' }
  }

  addDependencies(context.packageJson, eslintDeps, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
  })

  context.files['eslint.config.mjs'] = generateESLintConfig(language)
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check

import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginYml from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '**/*.d.ts', 'build'],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      /* TypeScript rules */
      '@typescript-eslint/no-explicit-any': 'off',

      /* plugin rules */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      /* React hooks rules */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      /* React refresh rules */
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      /* React rules */
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      /* stylistic rules */
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'array-element-newline': ['error', 'consistent'],
      'comma-spacing': ['error', { before: false, after: true }],
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'const', next: 'function' },
        { blankLine: 'always', prev: 'let', next: 'function' },
        { blankLine: 'any', prev: 'const', next: 'const' },
        { blankLine: 'any', prev: 'let', next: 'let' },
      ],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'dot-location': ['error', 'property'],
      'no-empty': ['error', { allowEmptyCatch: true }],
  },
)
`
  }
  else {
    return `// @ts-check

import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginYml from 'eslint-plugin-yml'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '**/*.d.ts', 'build'],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      /* plugin rules */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      /* React hooks rules */
      ...reactHooks.configs.recommended.rules,
      
      /* React refresh rules */
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      /* React rules */
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      /* stylistic rules */
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'array-element-newline': ['error', 'consistent'],
      'comma-spacing': ['error', { before: false, after: true }],
      'arrow-parens': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: 'const', next: 'function' },
        { blankLine: 'always', prev: 'let', next: 'function' },
        { blankLine: 'any', prev: 'const', next: 'const' },
        { blankLine: 'any', prev: 'let', next: 'let' },
      ],
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'dot-location': ['error', 'property'],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
`
  }
}
