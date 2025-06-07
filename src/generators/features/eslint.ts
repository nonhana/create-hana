import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const eslintGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    const eslintDeps: Record<string, string> = {
      eslint: '^9.0.0',
      globals: '^15.0.0',
    }

    if (language === 'typescript') {
      eslintDeps['@typescript-eslint/parser'] = '^8.0.0'
      eslintDeps['@typescript-eslint/eslint-plugin'] = '^8.0.0'
      eslintDeps['typescript-eslint'] = '^8.0.0'
    }

    addDependencies(context.packageJson, eslintDeps, 'devDependencies')

    const lintPattern = language === 'typescript' ? 'src/**/*.{ts,tsx}' : 'src/**/*.{js,jsx}'
    addScripts(context.packageJson, {
      'lint': `eslint ${lintPattern}`,
      'lint:fix': `eslint ${lintPattern} --fix`,
    })

    const eslintConfig = generateESLintConfig(language)
    context.files['eslint.config.mjs'] = eslintConfig
  },
}

function generateESLintConfig(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      
      'no-unused-vars': 'off',
    },
  },
  
  {
    files: ['**/*.{js,jsx}'],
    ...tseslint.configs.disableTypeChecked,
  },
  
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,ts}',
      'coverage/**',
    ],
  }
)
`
  }

  return `import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '*.config.{js,mjs,ts}',
      'coverage/**',
    ],
  },
]
`
}
