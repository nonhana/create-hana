import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

/**
 * ESLint feature generator
 */
export const eslintGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    // Add ESLint dependencies
    const eslintDeps: Record<string, string> = {
      eslint: '^8.0.0',
    }

    if (language === 'typescript') {
      eslintDeps['@typescript-eslint/parser'] = '^6.0.0'
      eslintDeps['@typescript-eslint/eslint-plugin'] = '^6.0.0'
    }

    addDependencies(context.packageJson, eslintDeps, 'devDependencies')

    // Add ESLint scripts
    const lintPattern = language === 'typescript' ? 'src/**/*.ts' : 'src/**/*.js'
    addScripts(context.packageJson, {
      'lint': `eslint ${lintPattern}`,
      'lint:fix': `eslint ${lintPattern} --fix`,
    })

    // Generate ESLint configuration
    const eslintConfig = generateESLintConfig(language)
    context.files['.eslintrc.json'] = eslintConfig
  },
}

/**
 * Generate ESLint configuration content
 */
function generateESLintConfig(language: 'typescript' | 'javascript') {
  const baseConfig = {
    env: {
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
    ],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  }

  if (language === 'typescript') {
    return JSON.stringify({
      ...baseConfig,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        ...baseConfig.extends,
        '@typescript-eslint/recommended',
      ],
      parserOptions: {
        ...baseConfig.parserOptions,
        project: './tsconfig.json',
      },
      rules: {
        ...baseConfig.rules,
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        'no-unused-vars': 'off', // Let TypeScript handle this
      },
    }, null, 2)
  }

  return JSON.stringify(baseConfig, null, 2)
}
