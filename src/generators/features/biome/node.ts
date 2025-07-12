import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateNodeBiomeConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  context.files['biome.json'] = generateBiomeConfig(language)
}

function generateBiomeConfig(language: 'typescript' | 'javascript') {
  const tsConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    organizeImports: {
      enabled: true,
    },
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 100,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
        suspicious: {
          noExplicitAny: 'warn',
          noShadowRestrictedNames: 'error',
        },
        style: {
          noNonNullAssertion: 'off',
          useFilenamingConvention: 'error',
        },
        correctness: {
          noSwitchDeclarations: 'error',
        },
      },
    },
    javascript: {
      formatter: {
        quoteStyle: 'single',
        semicolons: 'asNeeded',
        trailingCommas: 'es5',
        quoteProperties: 'asNeeded',
      },
    },
    json: {
      parser: {
        allowComments: true,
      },
      formatter: {
        enabled: true,
        trailingCommas: 'none',
      },
    },
  }

  const jsConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    organizeImports: {
      enabled: true,
    },
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 100,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
        suspicious: {
          noShadowRestrictedNames: 'error',
        },
        style: {
          useFilenamingConvention: 'error',
        },
        correctness: {
          noSwitchDeclarations: 'error',
        },
        nursery: {
          useValidTypeof: 'error',
        },
      },
    },
    javascript: {
      formatter: {
        quoteStyle: 'single',
        semicolons: 'asNeeded',
        trailingCommas: 'es5',
        quoteProperties: 'asNeeded',
      },
    },
    json: {
      parser: {
        allowComments: true,
      },
      formatter: {
        enabled: true,
        trailingCommas: 'none',
      },
    },
  }

  return JSON.stringify(language === 'typescript' ? tsConfig : jsConfig, null, 2)
}
