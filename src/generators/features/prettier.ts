import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

/**
 * Prettier feature generator
 */
export const prettierGenerator: Generator = {
  generate(context) {
    const { config } = context

    // Add Prettier dependencies
    addDependencies(context.packageJson, {
      prettier: '^3.0.0',
    }, 'devDependencies')

    // Add Prettier scripts
    const language = config.language || 'typescript'
    const pattern = language === 'typescript' ? 'src/**/*.{ts,json}' : 'src/**/*.{js,json}'

    addScripts(context.packageJson, {
      'format': `prettier --write ${pattern}`,
      'format:check': `prettier --check ${pattern}`,
    })

    // Generate Prettier configuration
    const prettierConfig = generatePrettierConfig()
    context.files['prettier.config.js'] = prettierConfig

    // Generate .prettierignore
    const prettierIgnore = generatePrettierIgnore()
    context.files['.prettierignore'] = prettierIgnore
  },
}

/**
 * Generate Prettier configuration content
 */
function generatePrettierConfig(): string {
  const config = {
    semi: false,
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    trailingComma: 'es5' as const,
    endOfLine: 'lf' as const,
  }

  return `module.exports = ${JSON.stringify(config, null, 2)}
`
}

/**
 * Generate .prettierignore content
 */
function generatePrettierIgnore(): string {
  return `# Dependencies
node_modules/

# Build output
dist/
build/

# Cache directories
.cache/

# Log files
*.log

# Environment files
.env*

# Coverage output
coverage/

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml
`
}
