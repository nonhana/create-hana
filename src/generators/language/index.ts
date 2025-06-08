import type { Generator, ProjectContext } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'
import { getFileExtension } from '@/utils/template'

/**
 * Language generator - handles TypeScript/JavaScript configuration
 */
export const languageGenerator: Generator = {
  generate(context) {
    const { config } = context
    const language = config.language || 'typescript'

    // Set file extension for other generators to use
    context.fileExtension = getFileExtension(language)

    if (language === 'typescript') {
      generateTypeScriptConfig(context)
    }
    else {
      generateJavaScriptConfig(context)
    }
  },
}

/**
 * Generate TypeScript configuration
 */
function generateTypeScriptConfig(context: ProjectContext): void {
  const { packageJson } = context

  // Add TypeScript dependencies
  addDependencies(packageJson, {
    'typescript': '^5.0.0',
    '@types/node': '^20.0.0',
  }, 'devDependencies')

  // Add TypeScript scripts
  addScripts(packageJson, {
    build: 'tsc',
    dev: 'tsc --watch',
  })

  // Set package.json fields for TypeScript
  packageJson.main = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'
  packageJson.files = ['dist']

  // Generate tsconfig.json
  const tsconfigContent = generateTsConfig()
  context.files['tsconfig.json'] = tsconfigContent
}

/**
 * Generate JavaScript configuration
 */
function generateJavaScriptConfig(context: ProjectContext): void {
  const { packageJson } = context

  // Set package.json fields for JavaScript
  packageJson.main = 'src/index.js'
  packageJson.files = ['src']

  // Add basic scripts
  addScripts(packageJson, {
    start: 'node src/index.js',
    dev: 'node --watch src/index.js',
  })
}

/**
 * Generate TypeScript configuration file content
 */
function generateTsConfig(): string {
  const config = {
    compilerOptions: {
      target: 'ES2020',
      module: 'CommonJS',
      lib: ['ES2020'],
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      moduleResolution: 'node',
      baseUrl: './',
      paths: {
        '@/*': ['src/*'],
      },
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', '**/*.test.ts', '**/*.spec.ts'],
  }

  return JSON.stringify(config, null, 2)
}
