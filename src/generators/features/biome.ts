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
    $schema: 'https://biomejs.dev/schemas/1.4.1/schema.json',
    organizeImports: {
      enabled: true,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
        style: {
          noNonNullAssertion: 'warn',
          useSingleQuotes: 'error',
          useSemicolons: 'off',
        },
        suspicious: {
          noExplicitAny: 'warn',
          noCaseDeclaration: 'error',
        },
        complexity: {
          noShadowRestrictedNames: 'error',
        },
      },
    },
    formatter: {
      enabled: true,
      formatWithErrors: false,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 100,
    },
    javascript: {
      formatter: {
        semicolons: 'asNeeded',
        quoteStyle: 'single',
        trailingComma: 'es5',
      },
    },
    json: {
      formatter: {
        enabled: true,
      },
    },
  }

  const jsConfig = {
    $schema: 'https://biomejs.dev/schemas/1.4.1/schema.json',

    organizeImports: {
      enabled: true,
    },

    linter: {
      enabled: true,
      rules: {
        recommended: true,
        style: {
          useSingleQuotes: 'error',
          useSemicolons: 'off',
        },
        suspicious: {
          noUselessCatch: 'error',
          noShadowRestrictedNames: 'error',
        },
        complexity: {
          noDuplicateCase: 'error',
          noLabelVar: 'error',
        },
      },
    },

    formatter: {
      enabled: true,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 100,
      formatWithErrors: false,
    },

    javascript: {
      formatter: {
        semicolons: 'asNeeded',
        quoteStyle: 'single',
        trailingComma: 'es5',
      },
    },

    json: {
      formatter: {
        enabled: true,
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
