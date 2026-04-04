import type { Config } from '@/types'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateProject } from '@/core/generator'

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

  async function readPackageJson(projectDir: string) {
    return JSON.parse(await readFile(join(projectDir, 'package.json'), 'utf8'))
  }

  it('should generate node + typescript + eslint-prettier + tsup', async () => {
    const config: Config = {
      targetDir: 'node-eslint-prettier-tsup',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'pnpm',
      codeQualityTools: 'eslint-prettier',
      bundler: 'tsup',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'node-eslint-prettier-tsup')
    const packageJson = await readPackageJson(projectDir)

    expect(existsSync(join(projectDir, 'src/index.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'tsup.config.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'eslint.config.mjs'))).toBe(true)
    expect(existsSync(join(projectDir, 'prettier.config.mjs'))).toBe(true)
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('@types/node')
    expect(packageJson.devDependencies).toHaveProperty('eslint')
    expect(packageJson.devDependencies).toHaveProperty('prettier')
    expect(packageJson.devDependencies).toHaveProperty('tsup')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
  }, 60000)

  it('should generate node + typescript + oxlint-oxfmt(type-aware) + express + tsx', async () => {
    const config: Config = {
      targetDir: 'node-oxlint-express',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'pnpm',
      codeQualityTools: 'oxlint-oxfmt',
      enableTypeAware: true,
      webserverPkgs: 'express',
      tsRuntimePkgs: 'tsx',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'node-oxlint-express')
    const packageJson = await readPackageJson(projectDir)

    expect(existsSync(join(projectDir, 'src/server.ts'))).toBe(true)
    expect(packageJson.dependencies).toHaveProperty('express')
    expect(packageJson.devDependencies).toHaveProperty('@types/express')
    expect(packageJson.devDependencies).toHaveProperty('tsx')
    expect(packageJson.devDependencies).toHaveProperty('oxlint')
    expect(packageJson.devDependencies).toHaveProperty('oxfmt')
    expect(packageJson.devDependencies).toHaveProperty('oxlint-tsgolint')
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('dev:watch')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('fmt')
  }, 60000)

  it('should generate react + typescript + vite + eslint', async () => {
    const config: Config = {
      targetDir: 'react-eslint-vite',
      projectType: 'react',
      language: 'typescript',
      pkgManager: 'pnpm',
      buildTool: 'vite',
      codeQualityTools: 'eslint',
      routingLibrary: 'none',
      stateManagement: 'none',
      queryLibrary: 'none',
      cssFramework: 'none',
      cssPreprocessor: 'none',
      httpLibrary: 'none',
      modulePathAliasing: 'none',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'react-eslint-vite')
    const packageJson = await readPackageJson(projectDir)

    expect(existsSync(join(projectDir, 'src/main.tsx'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/App.tsx'))).toBe(true)
    expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true)
    expect(packageJson.dependencies).toHaveProperty('react')
    expect(packageJson.dependencies).toHaveProperty('react-dom')
    expect(packageJson.dependencies).not.toHaveProperty('@vitejs/plugin-react')
    expect(packageJson.devDependencies).toHaveProperty('vite')
    expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react')
    expect(packageJson.devDependencies).toHaveProperty('@types/react')
    expect(packageJson.devDependencies).toHaveProperty('@types/react-dom')
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('lint')
  }, 60000)

  it('should generate vue + typescript + vite + eslint-prettier', async () => {
    const config: Config = {
      targetDir: 'vue-eslint-prettier-vite',
      projectType: 'vue',
      language: 'typescript',
      pkgManager: 'pnpm',
      buildTool: 'vite',
      codeQualityTools: 'eslint-prettier',
      useRouter: false,
      usePinia: false,
      cssFramework: 'none',
      cssPreprocessor: 'none',
      httpLibrary: 'none',
      modulePathAliasing: 'none',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'vue-eslint-prettier-vite')
    const packageJson = await readPackageJson(projectDir)

    expect(existsSync(join(projectDir, 'src/main.ts'))).toBe(true)
    expect(existsSync(join(projectDir, 'src/App.vue'))).toBe(true)
    expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true)
    expect(packageJson.dependencies).toHaveProperty('vue')
    expect(packageJson.devDependencies).toHaveProperty('vite')
    expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-vue')
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('vue-tsc')
    expect(packageJson.devDependencies).toHaveProperty('eslint')
    expect(packageJson.devDependencies).toHaveProperty('prettier')
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
  }, 60000)

  it('should generate vue + vite feature combinations that modify main entry', async () => {
    const config: Config = {
      targetDir: 'vue-vite-feature-combo',
      projectType: 'vue',
      language: 'typescript',
      pkgManager: 'pnpm',
      buildTool: 'vite',
      codeQualityTools: 'eslint-prettier',
      useRouter: true,
      usePinia: true,
      cssFramework: 'unocss',
      cssPreprocessor: 'none',
      httpLibrary: 'ky',
      modulePathAliasing: '@',
      git: false,
    }

    await generateProject(config, TEST_DIR)

    const projectDir = join(TEST_DIR, 'vue-vite-feature-combo')
    const packageJson = await readPackageJson(projectDir)
    const mainFile = await readFile(join(projectDir, 'src/main.ts'), 'utf8')
    const viteConfig = await readFile(join(projectDir, 'vite.config.ts'), 'utf8')

    expect(mainFile).toContain(`import 'virtual:uno.css'`)
    expect(mainFile).toContain(`import router from './router'`)
    expect(mainFile).toContain(`import { createPinia } from 'pinia'`)
    expect(mainFile).toContain(`createApp(App).use(createPinia()).use(router).mount('#app')`)

    expect(viteConfig).toContain(`import UnoCSS from 'unocss/vite'`)
    expect(viteConfig).toContain(`import path from 'node:path'`)
    expect(viteConfig).toContain(`vue()`)
    expect(viteConfig).toContain(`UnoCSS()`)
    expect(viteConfig).toContain(`'@': path.resolve(__dirname, "src")`)

    expect(packageJson.dependencies).toHaveProperty('pinia')
    expect(packageJson.dependencies).toHaveProperty('vue-router')
    expect(packageJson.dependencies).toHaveProperty('ky')
  }, 60000)
})
