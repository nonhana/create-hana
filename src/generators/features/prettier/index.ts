import type { ProjectContext } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export interface PrettierOptions {
  projectType?: 'node' | 'react' | 'vue'
  additionalConfig?: Record<string, any>
  linter?: 'oxlint' | 'eslint'
}

export function addPrettierDependencies(context: ProjectContext) {
  console.log('Adding Prettier dependencies...', context.config)
  addDependencies(context.packageJson, {
    'prettier': '^3.5.3',
    '@trivago/prettier-plugin-sort-imports': '^5.2.2',
  }, 'devDependencies')
}

export function addPrettierScripts(context: ProjectContext) {
  addScripts(context.packageJson, {
    'format': 'prettier --write .',
    'format:check': 'prettier --check .',
  })
}

export function generatePrettierConfig(options: PrettierOptions = {}) {
  const { projectType = 'node', additionalConfig = {} } = options
  const { linter } = options

  const plugins = [
    '@trivago/prettier-plugin-sort-imports',
    ...(linter === 'oxlint' ? ['@prettier/plugin-oxc'] : []),
  ]

  const baseConfig = {
    plugins,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    arrowParens: 'always',
    bracketSpacing: true,
    semi: false,
    endOfLine: 'lf',
    importOrder: ['^node:(.*)$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
  }

  // Project-specific configurations
  const projectConfigs = {
    node: {},
    react: {
      jsxSingleQuote: true,
    },
    vue: {
      printWidth: 100,
      useTabs: false,
      quoteProps: 'as-needed',
      bracketSameLine: false,
      vueIndentScriptAndStyle: false,
      htmlWhitespaceSensitivity: 'css',
      singleAttributePerLine: true,
    },
  }

  const config = {
    ...baseConfig,
    ...projectConfigs[projectType],
    ...additionalConfig,
  }

  return `/** @type {import("prettier").Config} */
export default ${JSON.stringify(config, null, 2)}
`
}
