import type { ProjectContext } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateNodeTSConfig(context: ProjectContext) {
  const { packageJson } = context

  addDependencies(packageJson, {
    'typescript': 'latest',
    '@types/node': 'latest',
  }, 'devDependencies')

  addScripts(packageJson, {
    'build': 'tsc',
    'build:watch': 'tsc --watch',
  })

  packageJson.main = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'
  packageJson.files = ['dist']

  const tsconfigContent = generateTsConfigFile()
  context.files['tsconfig.json'] = tsconfigContent
}

export function generateNodeJSConfig(context: ProjectContext) {
  const { packageJson } = context

  packageJson.main = 'src/index.js'
  packageJson.files = ['src']

  addScripts(packageJson, {
    start: 'node src/index.js',
    dev: 'node --watch src/index.js',
  })
}

function generateTsConfigFile() {
  const config = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      lib: ['ES2022'],
      outDir: './dist',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      forceConsistentCasingInFileNames: true,
      baseUrl: './',
      paths: {
        '@/*': ['src/*'],
      },
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: [
      'src/**/*.ts',
      '*.config.ts',
      'scripts/**/*.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  }

  return JSON.stringify(config, null, 2)
}
