import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'
import { generatePrettierConfig } from '../prettier'

export function generateReactOxlintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const oxlintDeps: Record<string, string> = {
    'oxlint': '^1.9.0',
    '@prettier/plugin-oxc': '^0.0.4',
  }

  addDependencies(context.packageJson, oxlintDeps, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'oxlint .',
    'lint:fix': 'oxlint . --fix',
  })

  addDependencies(context.packageJson, {
    'prettier': '^3.5.3',
    '@trivago/prettier-plugin-sort-imports': '^5.2.2',
  }, 'devDependencies')

  addScripts(context.packageJson, {
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
  })

  context.files['prettier.config.mjs'] = generatePrettierConfig({ projectType: 'react', linter: 'oxlint' })
  context.files['.oxlintrc.json'] = generateOxlintConfig(language)
}

function generateOxlintConfig(language: 'typescript' | 'javascript') {
  const config = {
    $schema: './node_modules/oxlint/configuration_schema.json',

    // Enable relevant plugins
    plugins: [
      'react',
      'react-hooks',
      'jsx-a11y',
      ...(language === 'typescript' ? ['typescript'] : []),
    ],

    env: {
      browser: true,
      es2022: true,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    // Let oxlint handle most rules automatically through categories
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      style: 'off',
    },

    // Only override specific rules when necessary
    rules: {
      // Allow flexibility for React development
      ...(language === 'typescript' && {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      }),

      // React-specific overrides
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
      'react/prop-types': 'off', // TypeScript handles this
    },

    ignorePatterns: ['dist/', 'build/', 'node_modules/'],
  }

  return JSON.stringify(config, null, 2)
}
