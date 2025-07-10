import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateReactESLintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const commonEslintDeps: Record<string, string> = {
    'eslint': '^9.28.0',
    '@eslint/js': '^9.28.0',
    'eslint-plugin-react': '^7.37.5',
    'eslint-plugin-react-hooks': '^5.1.0',
    'eslint-plugin-react-refresh': '^0.4.16',
    'eslint-plugin-jsx-a11y': '^6.10.2',
    'eslint-config-prettier': '^10.1.5',
    'globals': '^16.2.0',
  }

  const eslintDeps: Record<string, string> = { ...commonEslintDeps }

  if (language === 'typescript') {
    eslintDeps['typescript-eslint'] = '^8.33.1'
  }

  addDependencies(context.packageJson, eslintDeps, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
  })

  addDependencies(context.packageJson, {
    'prettier': '^3.5.3',
    '@trivago/prettier-plugin-sort-imports': '^5.2.2',
  }, 'devDependencies')

  addScripts(context.packageJson, {
    'format': `prettier --write .`,
    'format:check': `prettier --check .`,
  })

  context.files['prettier.config.mjs'] = generatePrettierConfig()
  context.files['eslint.config.mjs'] = generateESLintConfig(language)
}

function generatePrettierConfig() {
  return `/** @type {import("prettier").Config} */
export default {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  arrowParens: 'always',
  bracketSpacing: true,
  semi: false,
  importOrder: ['^node:(.*)$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
`
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/', 'build/'] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh,
      'jsx-a11y': eslintPluginJsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginJsxA11y.configs.recommended.rules,
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Custom overrides
      'react/prop-types': 'off', // TypeScript handles this
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintConfigPrettier,
)
`
  }
  else {
    return `// @ts-check
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'build/'] },
  eslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh,
      'jsx-a11y': eslintPluginJsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      ...eslintPluginReact.configs.recommended.rules,
      ...eslintPluginReact.configs['jsx-runtime'].rules,
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginJsxA11y.configs.recommended.rules,
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Custom overrides
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintConfigPrettier,
]
`
  }
}
