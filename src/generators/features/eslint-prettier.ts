import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const eslintPrettierGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    const eslintDeps: Record<string, string> = {
      eslint: '^9.0.0',
      globals: '^15.0.0',
      'eslint-plugin-import': '^2.29.0',
      'eslint-plugin-unicorn': '^46.0.0',
      'eslint-plugin-promise': '^6.1.1',
      'eslint-config-prettier': '^9.0.0',
    }

    if (language === 'typescript') {
      eslintDeps['typescript-eslint'] = '^8.0.0'
    }

    addDependencies(context.packageJson, eslintDeps, 'devDependencies')

    addDependencies(context.packageJson, {
      prettier: '^3.0.0',
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
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
};
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

/**
 * Generate eslint.config.mjs content, especially for Prettier
 */
function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  // Global ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,ts,cjs}',
      'coverage/**',
      '*.d.ts',
    ],
  },

  // 1. Base configuration (code quality focused)
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...importPlugin.configs.typescript,
  unicornPlugin.configs['flat/recommended'],
  promisePlugin.configs['flat/recommended'],

  // 2. Main rule configuration (no style rules included)
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Override and custom rules ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',

      // --- TypeScript rules ---
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      
      // --- Import plugin rules ---
      'import/order': ['error', { // import/order has style aspects but is more about logical organization, usually kept
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true },
      }],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-unresolved': 'off', // tsc handles this check

      // --- Unicorn plugin rules ---
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      
      // Disable rules that conflict with @typescript-eslint
      'no-unused-vars': 'off',
    },
  },

  // 3. Disable type checking for JS files
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  // 4. Prettier integration (must be last!)
  // This configuration disables all ESLint rules that conflict with Prettier.
  prettierConfig,
)
`
  } else {
    return `// @ts-check
import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import unicornPlugin from 'eslint-plugin-unicorn'
import promisePlugin from 'eslint-plugin-promise'
import prettierConfig from 'eslint-config-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Global ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,cjs}',
      'coverage/**',
    ],
  },

  // 1. Base configuration (code quality focused)
  js.configs.recommended,
  importPlugin.configs.recommended,
  unicornPlugin.configs['flat/recommended'],
  promisePlugin.configs['flat/recommended'],

  // 2. Main rule configuration
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // --- Override and custom rules ---
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',

      // --- Import plugin rules ---
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',

      // --- Unicorn plugin rules ---
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },

  // 3. Prettier integration (must be last)
  prettierConfig,
]
`
  }
}

/**
 * Generate .vscode/settings.json content
 */
function generateESLintPrettierVscodeConfig() {
  const config = {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit",
      "source.organizeImports": "never"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "eslint.validate": [
      "javascript",
      "typescript",
      "javascriptreact",
      "typescriptreact"
    ]
  }

  return JSON.stringify(config, null, 2)
}
