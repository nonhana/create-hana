import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateNodeESLintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const commonEslintDeps: Record<string, string> = {
    'eslint': '^9.28.0',
    '@eslint/js': '^9.28.0',
    'eslint-plugin-n': '^17.19.0',
    'eslint-plugin-unicorn': '^59.0.1',
    '@eslint/markdown': '^6.5.0',
    'eslint-plugin-jsonc': '^2.20.1',
    'eslint-plugin-yml': '^1.18.0',
    'eslint-config-prettier': '^10.1.5',
  }

  const eslintDeps: Record<string, string> = { ...commonEslintDeps }

  if (language === 'typescript') {
    eslintDeps['typescript-eslint'] = '^8.33.1'
  }
  else {
    eslintDeps.globals = '^16.2.0'
  }

  addDependencies(context.packageJson, eslintDeps, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
  })

  addDependencies(context.packageJson, {
    'prettier': '^3.5.3',
    '@trivago/prettier-plugin-sort-imports': '^5.2.2',
  }, 'devDependencies')

  addScripts(context.packageJson, {
    'format': `prettier --write .`,
    'format:check': `prettier --check .`,
  })

  context.files['prettier.config.mjs'] = generatePrettierConfig()
  context.files['eslint.config.mjs'] = generateESLintConfig(language)
}

function generatePrettierConfig() {
  return `/** @type {import("prettier").Config} */
export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  arrowParens: 'always',
  bracketSpacing: true,
  semi: false,
  importOrder: ['^node:(.*)$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
`
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginN from 'eslint-plugin-n'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  eslintPluginUnicorn.configs.recommended,
  pluginN.configs['flat/recommended-module'],
  markdown.configs.processor,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  eslintConfigPrettier,
)
`
  }
  else {
    return `// @ts-check
import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginN from 'eslint-plugin-n'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  pluginN.configs['flat/recommended-module'],
  eslintPluginUnicorn.configs.recommended,
  markdown.configs.processor,
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
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  eslintConfigPrettier,
]
`
  }
}
