import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export function generateBundlerConfig(context: ProjectContext) {
  const { config } = context
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (config.language !== 'typescript' || !config.bundler || config.bundler === 'none') {
    return
  }

  switch (config.bundler) {
    case 'tsup':
      generateTsupConfig(context)
      break
    case 'tsdown':
      generateTsdownConfig(context)
      break
  }
}

function generateTsupConfig(context: ProjectContext) {
  const { packageJson } = context

  addDependencies(packageJson, {
    'tsup': '^8.5.0',
    '@swc/core': '^1.11.31',
  }, 'devDependencies')

  addScripts(packageJson, {
    'build': 'tsup',
    'build:watch': 'tsup --watch',
  })

  packageJson.main = 'dist/index.js'
  packageJson.module = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'
  packageJson.exports = {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    },
  }

  const tsupConfig = generateTsupConfigFile()
  context.files['tsup.config.ts'] = tsupConfig
}

function generateTsdownConfig(context: ProjectContext) {
  const { packageJson } = context

  addDependencies(packageJson, {
    tsdown: '^0.12.6',
  }, 'devDependencies')

  addScripts(packageJson, {
    'build': 'tsdown',
    'build:watch': 'tsdown --watch',
    'start': 'node dist/index.js',
  })

  packageJson.main = 'dist/index.js'
  packageJson.module = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'
  packageJson.exports = {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    },
  }

  const tsdownConfig = generateTsdownConfigFile()
  context.files['tsdown.config.ts'] = tsdownConfig
}

function generateTsupConfigFile(): string {
  return `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'es2020',
})
`
}

function generateTsdownConfigFile(): string {
  return `import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
})
`
}
