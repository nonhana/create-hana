import type { Config, ProjectContext } from '@/types'
import { generateOxfmtConfig } from '../oxfmt'

export function generateReactOxlintOxfmtConfig(context: ProjectContext<
  Extract<Config, { projectType: 'react', codeQualityTools: 'oxlint-oxfmt' }>
>) {
  const { config } = context

  const language = config.language || 'typescript'

  context.files['.oxlintrc.json'] = generateOxlintConfig(language, config.enableTypeAware)
  context.files['.oxfmtrc.json'] = generateOxfmtConfig(language)
}

function generateOxlintConfig(language: 'typescript' | 'javascript', enableTypeAware: boolean) {
  const isTS = language === 'typescript'

  const config = {
    $schema: './node_modules/oxlint/configuration_schema.json',
    plugins: isTS
      ? ['typescript', 'react', 'jsx-a11y']
      : ['react', 'react-hooks', 'react-refresh', 'jsx-a11y'],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      pedantic: 'off',
      style: 'off',
      nursery: 'off',
    },
    env: {
      builtin: true,
      browser: true,
      es2026: true,
    },
    ignorePatterns: isTS
      ? ['dist', 'build', 'node_modules', '.next']
      : ['dist', 'build', 'node_modules'],
    rules: {
      ...(language === 'javascript'
        ? {
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always'],
          }
        : {}),

      'react/react-in-jsx-scope': 'off',
      'react/exhaustive-deps': 'warn',
      'react/rules-of-hooks': 'error',
      'react/jsx-no-undef': 'error',
      'react/only-export-components': ['warn', { allowConstantExport: true }],

      ...(isTS
        ? {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': ['error', { minimumDescriptionLength: 10 }],
          }
        : {}),
    },

    ...(isTS && enableTypeAware
      ? {
          options: {
            typeAware: true,
          },
        }
      : {}),
  }

  return JSON.stringify(config, null, 2)
}
