import type { Generator, ProjectContext } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

/**
 * Biome feature generator - all-in-one tool for linting and formatting
 */
export const biomeGenerator: Generator = {
  generate(context: ProjectContext): void {
    // Add Biome dependencies
    addDependencies(context.packageJson, {
      '@biomejs/biome': '^1.4.0',
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
    const biomeConfig = generateBiomeConfig()
    context.files['biome.json'] = biomeConfig
  },
}

/**
 * Generate Biome configuration content
 */
function generateBiomeConfig(): string {
  const config = {
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
        },
        suspicious: {
          noExplicitAny: 'warn',
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

  return JSON.stringify(config, null, 2)
}
