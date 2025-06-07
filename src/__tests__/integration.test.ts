import type { Config } from '@/types'
import { existsSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateProject } from '@/core/orchestrator'

const TEST_DIR = join(__dirname, '../../test-output')

describe('project Generation Integration', () => {
  beforeEach(async () => {
    // Ensure test directory exists
    if (!existsSync(TEST_DIR)) {
      await mkdir(TEST_DIR, { recursive: true })
    }
  })

  afterEach(async () => {
    // Clean up test output with retry for Windows file locking
    if (existsSync(TEST_DIR)) {
      try {
        await rm(TEST_DIR, { recursive: true, force: true })
      }
      catch {
        // Retry after a short delay on Windows
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
          await rm(TEST_DIR, { recursive: true, force: true })
        }
        catch {
          // Ignore cleanup errors in tests
          console.warn('Failed to clean up test directory, continuing...')
        }
      }
    }
  })

  it('should generate a TypeScript Node.js project with ESLint and Prettier', async () => {
    const config: Config = {
      targetDir: 'test-ts-project',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'npm',
      codeQualityTools: 'eslint-prettier',
      bundler: 'tsup',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'test-ts-project')

    // Check that project directory was created
    expect(existsSync(projectDir)).toBe(true)

    // Check essential files
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/index.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'tsconfig.json'))).toBe(true)
    expect(existsSync(join(projectDir, '.eslintrc.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'prettier.config.js'))).toBe(true)
    expect(existsSync(join(projectDir, '.prettierignore'))).toBe(true)
    expect(existsSync(join(projectDir, 'tsup.config.ts'))).toBe(true)
    expect(existsSync(join(projectDir, '.gitignore'))).toBe(true)
    expect(existsSync(join(projectDir, 'README.md'))).toBe(true)

    // Check package.json content
    const packageJsonPath = join(projectDir, 'package.json')
    const packageJson = JSON.parse(await import('node:fs/promises').then(fs => fs.readFile(packageJsonPath, 'utf8')))

    expect(packageJson.name).toBe('test-ts-project')
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('@types/node')
    expect(packageJson.devDependencies).toHaveProperty('eslint')
    expect(packageJson.devDependencies).toHaveProperty('prettier')
    expect(packageJson.devDependencies).toHaveProperty('tsup')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
  }, 60000) // Increase timeout to 60 seconds

  it('should generate a JavaScript Node.js project with Biome', async () => {
    const config: Config = {
      targetDir: 'test-js-project',
      projectType: 'node',
      language: 'javascript',
      pkgManager: 'pnpm',
      codeQualityTools: 'biome',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'test-js-project')

    // Check that project directory was created
    expect(existsSync(projectDir)).toBe(true)

    // Check essential files
    expect(existsSync(join(projectDir, 'package.json'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/index.js'))).toBe(true)
    expect(existsSync(join(projectDir, 'biome.json'))).toBe(true)
    expect(existsSync(join(projectDir, '.gitignore'))).toBe(true)
    expect(existsSync(join(projectDir, 'README.md'))).toBe(true)

    // Should not have TypeScript files
    expect(existsSync(join(projectDir, 'tsconfig.json'))).toBe(false)
    expect(existsSync(join(projectDir, 'src/index.ts'))).toBe(false)

    // Check package.json content
    const packageJsonPath = join(projectDir, 'package.json')
    const packageJson = JSON.parse(await import('node:fs/promises').then(fs => fs.readFile(packageJsonPath, 'utf8')))

    expect(packageJson.name).toBe('test-js-project')
    expect(packageJson.main).toBe('src/index.js')
    expect(packageJson.devDependencies).toHaveProperty('@biomejs/biome')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
    expect(packageJson.scripts).toHaveProperty('check')
  }, 60000)

  it('should generate a TypeScript project with Express server', async () => {
    const config: Config = {
      targetDir: 'test-express-project',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'npm',
      webserverPkgs: 'express',
      tsRuntimePkgs: 'tsx',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'test-express-project')

    // Check that project directory was created
    expect(existsSync(projectDir)).toBe(true)

    // Check server file
    expect(existsSync(join(projectDir, 'src/server.ts'))).toBe(true)

    // Check package.json content
    const packageJsonPath = join(projectDir, 'package.json')
    const packageJson = JSON.parse(await import('node:fs/promises').then(fs => fs.readFile(packageJsonPath, 'utf8')))

    expect(packageJson.dependencies).toHaveProperty('express')
    expect(packageJson.devDependencies).toHaveProperty('@types/express')
    expect(packageJson.devDependencies).toHaveProperty('tsx')
    expect(packageJson.scripts).toHaveProperty('dev:ts')
    expect(packageJson.scripts).toHaveProperty('start:ts')
  }, 60000)
})
