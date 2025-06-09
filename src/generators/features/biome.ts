import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const biomeGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    // Add Biome dependencies
    addDependencies(context.packageJson, {
      '@biomejs/biome': '^1.9.4',
    }, 'devDependencies')

    // Add Biome scripts
    addScripts(context.packageJson, {
      'lint': 'biome lint src/',
      'lint:fix': 'biome lint --apply src/',
      'format': 'biome format --write src/',
      'format:check': 'biome format src/',
      'check': 'biome check src/',
      'check:fix': 'biome check --apply src/',
    })

    // Generate Biome configuration
    const biomeConfig = generateBiomeConfig(language)
    context.files['biome.json'] = biomeConfig

    // Generate Biome VSCode configuration
    if (context.config.codeQualityConfig) {
      const biomeVscodeConfig = generateBiomeVscodeConfig()
      context.files['.vscode/settings.json'] = biomeVscodeConfig
    }
  },
}

/**
 * Generate Biome configuration content
 */
function generateBiomeConfig(language: 'typescript' | 'javascript'): string {
  const tsConfig = {
    $schema: 'https://biomejs.dev/schemas/latest/schema.json',
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
          noNonNullAssertion: 'warn',
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
    $schema: 'https://biomejs.dev/schemas/latest/schema.json',
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

/**
 * Generate Biome VSCode configuration
 */
function generateBiomeVscodeConfig() {
  const config = {
    // Disable Prettier & ESLint
    'prettier.enable': false,
    'editor.codeActionsOnSave': {},
    'eslint.enable': false,

    // Enable Biome plugin formatting functionality
    'editor.defaultFormatter': 'biomejs.biome',

    // Formatting related settings
    'editor.formatOnSave': true,
    'editor.formatOnPaste': true,
    'editor.formatOnType': false,

    // Enable Biome formatter for specific languages
    '[javascript]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[javascriptreact]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[typescriptreact]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[json]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[jsonc]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
  }

  return JSON.stringify(config, null, 2)
}
