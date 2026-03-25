import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset, addScripts } from '@/utils/package-json'

export function generateNodeESLintConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  addDependencyPreset(
    context.packageJson,
    language === 'typescript'
      ? 'feature.eslint.node.typescript'
      : 'feature.eslint.node.javascript',
  )

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
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import pluginN from 'eslint-plugin-n'
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'coverage/'],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintPluginUnicorn.configs.recommended,
  pluginN.configs['flat/recommended-module'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    languageOptions: {
      sourceType: 'module',
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      /* plugin rules */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

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
  else {
    return `// @ts-check

import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginN from 'eslint-plugin-n'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'coverage/'],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  pluginN.configs['flat/recommended-module'],
  eslintPluginUnicorn.configs.recommended,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

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
  }
)
`
  }
}
