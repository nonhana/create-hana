import type { Generator, ProjectContext } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

/**
 * Bundler generator - handles TypeScript bundling tools
 */
export const bundlerGenerator: Generator = {
  generate(context) {
    const { config } = context

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
  },
}

/**
 * Generate tsup configuration
 */
function generateTsupConfig(context: ProjectContext): void {
  const { packageJson } = context

  // Add tsup dependencies
  addDependencies(packageJson, {
    tsup: '^8.5.0',
  }, 'devDependencies')

  // Override build scripts
  addScripts(packageJson, {
    'build': 'tsup',
    'build:watch': 'tsup --watch',
  })

  // Update package.json for dual module support
  packageJson.main = 'dist/index.js'
  packageJson.module = 'dist/index.mjs'
  packageJson.types = 'dist/index.d.ts'
  packageJson.exports = {
    '.': {
      require: './dist/index.js',
      import: './dist/index.mjs',
      types: './dist/index.d.ts',
    },
  }

  // Generate tsup config
  const tsupConfig = generateTsupConfigFile()
  context.files['tsup.config.ts'] = tsupConfig
}

/**
 * Generate tsdown configuration
 */
function generateTsdownConfig(context: ProjectContext): void {
  const { packageJson } = context

  // Add tsdown dependencies
  addDependencies(packageJson, {
    tsdown: '^0.12.6',
  }, 'devDependencies')

  // Override build scripts
  addScripts(packageJson, {
    'build': 'tsdown',
    'build:watch': 'tsdown --watch',
    'start': 'node dist/index.js',
  })

  // Update package.json for dual module support
  packageJson.main = 'dist/index.cjs'
  packageJson.module = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'
  packageJson.exports = {
    '.': {
      require: './dist/index.cjs',
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
  }

  // Generate tsdown config
  const tsdownConfig = generateTsdownConfigFile()
  context.files['tsdown.config.ts'] = tsdownConfig
}

/**
 * Generate tsup configuration file content
 */
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

/**
 * Generate tsdown configuration file content
 */
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
