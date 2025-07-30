import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'
import { addPrettierDependencies, addPrettierScripts, generatePrettierConfig } from '../prettier'

export function generateVueOxlintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  addDependencies(context.packageJson, {
    'oxlint': '^1.9.0',
    '@prettier/plugin-oxc': '^0.0.4',
  }, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'oxlint .',
    'lint:fix': 'oxlint . --fix',
  })

  addPrettierDependencies(context)
  addPrettierScripts(context)

  context.files['prettier.config.mjs'] = generatePrettierConfig({ projectType: 'vue', linter: 'oxlint' })
  context.files['.oxlintrc.json'] = generateOxlintConfig(language)
}

function generateOxlintConfig(language: 'typescript' | 'javascript') {
  const config = {
    $schema: './node_modules/oxlint/configuration_schema.json',

    plugins: [
      'vue',
      ...(language === 'typescript' ? ['typescript'] : []),
    ],

    env: {
      browser: true,
      es2022: true,
    },

    settings: {
      vue: {
        version: 'detect',
      },
    },

    categories: {
      correctness: 'error',
      suspicious: 'warn',
      style: 'off',
    },

    rules: {
      ...(language === 'typescript' && {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }],
      }),

      'vue/multi-word-component-names': 'off', // Allow single-word components
    },

    ignorePatterns: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      '.nuxt/',
      'coverage/',
      'public/',
      '**/*.d.ts',
    ],
  }

  return JSON.stringify(config, null, 2)
}
