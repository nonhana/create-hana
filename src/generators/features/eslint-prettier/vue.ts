import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'
import { addPrettierDependencies, addPrettierScripts, generatePrettierConfig } from '../prettier'

export function generateVueESLintPrettierConfig(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const language = config.language || 'typescript'

  const commonEslintDeps: Record<string, string> = {
    'eslint': '^9.30.1',
    '@eslint/js': '^9.30.1',
    'eslint-plugin-vue': '^9.32.0',
    'vue-eslint-parser': '^9.4.3',
    'eslint-config-prettier': '^10.1.5',
    'typescript-eslint': '^8.36.0',
  }

  let eslintDeps: Record<string, string>

  if (language === 'typescript') {
    eslintDeps = { ...commonEslintDeps }
  }
  else {
    eslintDeps = { ...commonEslintDeps, globals: '^16.3.0' }
  }

  addDependencies(context.packageJson, eslintDeps, 'devDependencies')

  addScripts(context.packageJson, {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
  })

  addPrettierDependencies(context)
  addPrettierScripts(context)

  context.files['prettier.config.mjs'] = generatePrettierConfig({ projectType: 'vue' })
  context.files['eslint.config.mjs'] = generateESLintConfig(language)
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `// @ts-check
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      '.nuxt/',
      'coverage/',
      'public/',
      '**/*.d.ts',
    ],
  },
  
  // Base configurations
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  ...eslintPluginVue.configs['flat/recommended'],
  
  // Main configuration
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Vue rules - based on official recommendations
      'vue/multi-word-component-names': 'warn',
      'vue/no-reserved-component-names': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits'],
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'any', // Compatible with Prettier
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      }],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    },
  },
  
  // Special rules for .vue files
  {
    files: ['**/*.vue'],
    rules: {
      // Disable some TS rules that don't work well with Vue SFC
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  
  // Configuration files rules
  {
    files: ['**/*.config.{js,mjs,ts}', '**/.*rc.{js,mjs,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  
  // Prettier integration - must be last
  eslintConfigPrettier,
)
`
  }
  else {
    return `// @ts-check
import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'build/',
      'node_modules/',
      '.vite/',
      '.nuxt/',
      'coverage/',
      'public/',
    ],
  },
  
  // Base configurations
  eslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  
  // Main configuration
  {
    files: ['**/*.{js,mjs,cjs,jsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Vue rules - based on official recommendations
      'vue/multi-word-component-names': 'warn',
      'vue/no-reserved-component-names': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits'],
      }],
      'vue/html-self-closing': ['error', {
        html: {
          void: 'any', // Compatible with Prettier
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      }],
      
      // JavaScript rules
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
  
  // Prettier integration - must be last
  eslintConfigPrettier,
]
`
  }
}
