import type { ProjectContext } from '@/types'
import { describe, expect, it } from 'vitest'
import { languageGenerator } from '../language'

describe('languageGenerator', () => {
  it('should generate TypeScript configuration', () => {
    const context: ProjectContext = {
      config: {
        language: 'typescript',
        targetDir: 'test-project',
      },
      projectDir: '/test/test-project',
      cwd: '/test',
      packageJson: {
        name: 'test-project',
        version: '1.0.0',
      },
      files: {},
      fileExtension: '.js',
    }

    languageGenerator.generate(context)

    // Check file extension is set
    expect(context.fileExtension).toBe('.ts')

    // Check TypeScript dependencies are added
    expect(context.packageJson.devDependencies).toEqual({
      'typescript': 'latest',
      '@types/node': 'latest',
    })

    // Check TypeScript scripts are added
    expect(context.packageJson.scripts).toEqual({
      'build': 'tsc',
      'build:watch': 'tsc --watch',
    })

    // Check package.json fields for TypeScript
    expect(context.packageJson.main).toBe('dist/index.js')
    expect(context.packageJson.types).toBe('dist/index.d.ts')
    expect(context.packageJson.files).toEqual(['dist'])

    // Check tsconfig.json is generated
    expect(context.files['tsconfig.json']).toBeDefined()
    const tsconfig = JSON.parse(context.files['tsconfig.json'] as string)
    expect(tsconfig.compilerOptions.target).toBe('ES2022')
    expect(tsconfig.compilerOptions.outDir).toBe('./dist')
  })

  it('should generate JavaScript configuration', () => {
    const context: ProjectContext = {
      config: {
        language: 'javascript',
        targetDir: 'test-project',
      },
      projectDir: '/test/test-project',
      cwd: '/test',
      packageJson: {
        name: 'test-project',
        version: '1.0.0',
      },
      files: {},
      fileExtension: '.ts',
    }

    languageGenerator.generate(context)

    // Check file extension is set
    expect(context.fileExtension).toBe('.js')

    // Check package.json fields for JavaScript
    expect(context.packageJson.main).toBe('src/index.js')
    expect(context.packageJson.files).toEqual(['src'])

    // Check JavaScript scripts are added
    expect(context.packageJson.scripts).toEqual({
      start: 'node src/index.js',
      dev: 'node --watch src/index.js',
    })

    // Should not have TypeScript dependencies
    expect(context.packageJson.devDependencies).toBeUndefined()

    // Should not generate tsconfig.json
    expect(context.files['tsconfig.json']).toBeUndefined()
  })

  it('should default to TypeScript when language is not specified', () => {
    const context: ProjectContext = {
      config: {
        targetDir: 'test-project',
      },
      projectDir: '/test/test-project',
      cwd: '/test',
      packageJson: {
        name: 'test-project',
        version: '1.0.0',
      },
      files: {},
      fileExtension: '.js',
    }

    languageGenerator.generate(context)

    expect(context.fileExtension).toBe('.ts')
    expect(context.packageJson.devDependencies).toBeDefined()
    expect(context.files['tsconfig.json']).toBeDefined()
  })
})
