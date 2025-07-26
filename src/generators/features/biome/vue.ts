import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateVueBiomeConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  context.files['biome.json'] = generateBiomeConfig(language)
}

function generateBiomeConfig(language: 'typescript' | 'javascript') {
  const tsConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
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
          noNonNullAssertion: 'off',
          useFilenamingConvention: 'off', // Disabled for Vue components (PascalCase naming)
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
      },
      formatter: {
        quoteStyle: 'single',
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
    // Vue specific overrides based on official documentation
    overrides: [
      {
        include: ['**/*.vue'],
        linter: {
          rules: {
            style: {
              useConst: 'off',
              useImportType: 'off',
            },
            correctness: {
              noUnusedVariables: 'off',
              noUnusedImports: 'off',
            },
          },
        },
      },
    ],
  }

  const jsConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
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
          useFilenamingConvention: 'off', // Disabled for Vue components (PascalCase naming)
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
      },
      formatter: {
        quoteStyle: 'single',
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
    // Vue specific overrides based on official documentation
    overrides: [
      {
        include: ['**/*.vue'],
        linter: {
          rules: {
            style: {
              useConst: 'off',
              useImportType: 'off',
            },
            correctness: {
              noUnusedVariables: 'off',
              noUnusedImports: 'off',
            },
          },
        },
      },
    ],
  }

  return JSON.stringify(language === 'typescript' ? tsConfig : jsConfig, null, 2)
}
