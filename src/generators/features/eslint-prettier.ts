import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const eslintPrettierGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    const commonEslintDeps: Record<string, string> = {
      'eslint': '^9.28.0',
      '@eslint/js': '^9.28.0',
      'eslint-plugin-n': '^17.19.0',
      'eslint-plugin-unicorn': '^59.0.1',
      '@eslint/markdown': '^6.5.0',
      'eslint-plugin-jsonc': '^2.20.1',
      'eslint-plugin-yml': '^1.18.0',
      'eslint-config-prettier': '^10.1.5',
    }

    const eslintDeps: Record<string, string> = { ...commonEslintDeps }

    if (language === 'typescript') {
      eslintDeps['typescript-eslint'] = '^8.33.1'
    }
    else {
      eslintDeps.globals = '^16.2.0'
    }

    addDependencies(context.packageJson, eslintDeps, 'devDependencies')

    addDependencies(context.packageJson, {
      'prettier': '^3.5.3',
      '@trivago/prettier-plugin-sort-imports': '^5.2.2',
    }, 'devDependencies')

    const pattern = language === 'typescript' ? 'src/**/*.{ts,json}' : 'src/**/*.{js,json}'

    addScripts(context.packageJson, {
      'format': `prettier --write ${pattern}`,
      'format:check': `prettier --check ${pattern}`,
    })

    const prettierConfig = generatePrettierConfig()
    context.files['prettier.config.mjs'] = prettierConfig

    const prettierIgnore = generatePrettierIgnore()
    context.files['.prettierignore'] = prettierIgnore

    const eslintConfig = generateESLintConfig(language)
    context.files['eslint.config.mjs'] = eslintConfig

    if (context.config.codeQualityConfig) {
      const eslintPrettierVscodeConfig = generateESLintPrettierVscodeConfig()
      context.files['.vscode/settings.json'] = eslintPrettierVscodeConfig
    }
  },
}

/**
 * Generate Prettier configuration content
 */
function generatePrettierConfig(): string {
  return `/** @type {import("prettier").Config} */
export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  arrowParens: 'always',
  bracketSpacing: true,
  importOrder: ['^node:(.*)$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
`
}

/**
 * Generate eslint.config.mjs content, especially for Prettier
 */
function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginN from 'eslint-plugin-n'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  eslintPluginUnicorn.configs.recommended,
  pluginN.configs['flat/recommended-module'],
  markdown.configs.processor,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  eslintConfigPrettier,
)
`
  }
  else {
    return `// @ts-check
import eslint from '@eslint/js'
import markdown from '@eslint/markdown'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import pluginN from 'eslint-plugin-n'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import eslintPluginYml from 'eslint-plugin-yml'
import globals from 'globals'

export default [
  eslint.configs.recommended,
  pluginN.configs['flat/recommended-module'],
  eslintPluginUnicorn.configs.recommended,
  markdown.configs.processor,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  ...eslintPluginYml.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  eslintConfigPrettier,
]
`
  }
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

/**
 * Generate .vscode/settings.json content
 */
function generateESLintPrettierVscodeConfig() {
  const config = {
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
      'source.organizeImports': 'never',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
    },
    '[javascript]': {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
    },
    'eslint.validate': [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
    ],
  }

  return JSON.stringify(config, null, 2)
}
