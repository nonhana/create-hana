import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateVueESLintConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const commonDeps: Record<string, string> = {
    'eslint': '^9.30.1',
    '@eslint/js': '^9.30.1',
    'eslint-plugin-vue': '^9.32.0',
    'vue-eslint-parser': '^9.4.3',
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
import eslintPluginVue from 'eslint-plugin-vue'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginYml from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      '.nuxt/',
      'coverage/',
      'public/',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...eslintPluginVue.configs['flat/recommended'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      /* TypeScript rules */
      '@typescript-eslint/no-explicit-any': 'off',

      /* plugin rules */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* Vue rules */
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',

      /* stylistic rules */
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
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
import eslintPluginVue from 'eslint-plugin-vue'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginYml from 'eslint-plugin-yml'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      'dist/',
      'build/', 
      'node_modules/',
      '.vite/',
      '.nuxt/',
      'coverage/',
      'public/',
    ],
  },
  eslint.configs.recommended,
  markdown.configs.processor,
  ...eslintPluginVue.configs['flat/recommended'],
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,jsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      /* plugin rules */
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      /* Vue rules */
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',

      /* stylistic rules */
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
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
]
`
  }
}
