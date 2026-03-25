import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset, addScripts } from '@/utils/package-json'
import { addPrettierDependencies, addPrettierScripts, generatePrettierConfig } from '../prettier'

export function generateNodeESLintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'node' && config.projectType !== 'hono')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  addDependencyPreset(
    context.packageJson,
    language === 'typescript'
      ? 'feature.eslint-prettier.node.typescript'
      : 'feature.eslint-prettier.node.javascript',
  )

  addScripts(context.packageJson, {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
  })

  addPrettierDependencies(context)
  addPrettierScripts(context)

  context.files['prettier.config.mjs'] = generatePrettierConfig({ projectType: 'node' })
  context.files['eslint.config.mjs'] = generateESLintConfig(language)
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
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'coverage/'],
  },
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
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'coverage/'],
  },
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
