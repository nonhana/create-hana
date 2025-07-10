import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateReactBiomeConfig(context: ProjectContext) {
  const { config } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  context.files['biome.json'] = generateBiomeConfig(language)
}

function generateBiomeConfig(language: 'typescript' | 'javascript') {
  const tsConfig = {
    $schema: 'https://biomejs.dev/schemas/latest/schema.json',
    files: {
      ignore: [
        'dist/',
        'build/',
        'node_modules/',
        '**/*.d.ts',
        'coverage/',
        'public/',
        '.vite/',
        'storybook-static/',
      ],
    },
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
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
          noEmptyBlockStatements: 'error',
          useAwait: 'error',
        },
        style: {
          noNonNullAssertion: 'warn',
          useFilenamingConvention: 'error',
          useForOf: 'error',
          useShorthandArrayType: 'error',
          useConsistentArrayType: 'error',
        },
        correctness: {
          noSwitchDeclarations: 'error',
          noUnusedImports: 'error',
          noUnusedVariables: 'error',
        },
        complexity: {
          noUselessTypeConstraint: 'error',
        },
      },
    },
    javascript: {
      parser: {
        unsafeParameterDecoratorsEnabled: false,
        jsxEverywhere: true,
      },
      jsxRuntime: 'transparent',
      formatter: {
        quoteStyle: 'single',
        jsxQuoteStyle: 'double',
        semicolons: 'asNeeded',
        trailingCommas: 'es5',
        quoteProperties: 'asNeeded',
        arrowParentheses: 'always',
        bracketSpacing: true,
        bracketSameLine: false,
      },
    },
    json: {
      parser: {
        allowComments: true,
        allowTrailingCommas: true,
      },
      formatter: {
        enabled: true,
        trailingCommas: 'none',
      },
    },
  }

  const jsConfig = {
    $schema: 'https://biomejs.dev/schemas/latest/schema.json',
    files: {
      ignore: [
        'dist/',
        'build/',
        'node_modules/',
        '**/*.d.ts',
        'coverage/',
        'public/',
        '.vite/',
        'storybook-static/',
      ],
    },
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
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
          noEmptyBlockStatements: 'error',
          useAwait: 'error',
        },
        style: {
          useFilenamingConvention: 'error',
          useForOf: 'error',
          useShorthandArrayType: 'error',
        },
        correctness: {
          noSwitchDeclarations: 'error',
          noUnusedImports: 'error',
        },
        nursery: {
          useValidTypeof: 'error',
        },
      },
    },
    javascript: {
      parser: {
        unsafeParameterDecoratorsEnabled: false,
        jsxEverywhere: true,
      },
      jsxRuntime: 'transparent',
      formatter: {
        quoteStyle: 'single',
        jsxQuoteStyle: 'double',
        semicolons: 'asNeeded',
        trailingCommas: 'es5',
        quoteProperties: 'asNeeded',
        arrowParentheses: 'always',
        bracketSpacing: true,
        bracketSameLine: false,
      },
    },
    json: {
      parser: {
        allowComments: true,
        allowTrailingCommas: true,
      },
      formatter: {
        enabled: true,
        trailingCommas: 'none',
      },
    },
  }

  return JSON.stringify(language === 'typescript' ? tsConfig : jsConfig, null, 2)
}
