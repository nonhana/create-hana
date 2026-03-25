import type { Config, ProjectContext } from '@/types'
import { generateOxfmtConfig } from '../oxfmt'

export function generateNodeOxlintOxfmtConfig(context: ProjectContext<
  Extract<Config, { projectType: 'node', codeQualityTools: 'oxlint-oxfmt' }>
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
    plugins: isTS ? ['typescript', 'unicorn', 'node'] : ['unicorn', 'node', 'jsdoc'],

    env: {
      builtin: true,
      node: true,
      es2026: true,
    },

    categories: {
      correctness: 'error',
      suspicious: 'warn',
      pedantic: 'off',
      style: 'off',
      nursery: 'off',
    },

    rules: {
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-module': 'error',
      'unicorn/prefer-top-level-await': 'error',

      ...(isTS
        ? {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/ban-ts-comment': [
              'error',
              {
                minimumDescriptionLength: 10,
              },
            ],
          }
        : {
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always'],

            'jsdoc/require-jsdoc': 'off',
            'jsdoc/check-param-names': 'warn',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/valid-types': 'error',
          }),
    },

    ...(isTS
      ? {
          overrides: [
            {
              files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
              rules: {
                'no-var': 'error',
                'prefer-const': 'error',
              },
            },
          ],
        }
      : {}),

    ...((isTS && enableTypeAware)
      ? {
          options: {
            typeAware: true,
          },
        }
      : {}),
  }

  return JSON.stringify(config, null, 2)
}
