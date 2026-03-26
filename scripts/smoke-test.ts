import type { Config } from '../src/types'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { generateProject } from '../src/core/generator'

interface SmokeCase {
  name: string
  config: Config
}

const smokeCases: SmokeCase[] = [
  {
    name: 'node-eslint-prettier-tsup',
    config: {
      targetDir: 'node-eslint-prettier-tsup',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'pnpm',
      codeQualityTools: 'eslint-prettier',
      bundler: 'tsup',
      git: false,
      installDeps: false,
    },
  },
  {
    name: 'node-oxlint-express',
    config: {
      targetDir: 'node-oxlint-express',
      projectType: 'node',
      language: 'typescript',
      pkgManager: 'pnpm',
      codeQualityTools: 'oxlint-oxfmt',
      enableTypeAware: true,
      webserverPkgs: 'express',
      tsRuntimePkgs: 'tsx',
      git: false,
      installDeps: false,
    },
  },
  {
    name: 'react-eslint-vite',
    config: {
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
      installDeps: false,
    },
  },
  {
    name: 'vue-eslint-prettier-vite',
    config: {
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
      installDeps: false,
    },
  },
]

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`)
  }
}

async function readPackageJson(projectDir: string) {
  return JSON.parse(await readFile(join(projectDir, 'package.json'), 'utf8'))
}

async function runSmokeCase(workspaceDir: string, smokeCase: SmokeCase) {
  await generateProject(smokeCase.config, workspaceDir)

  const projectDir = join(workspaceDir, smokeCase.name)
  const packageJson = await readPackageJson(projectDir)

  run('npm', ['install'], projectDir)

  if (packageJson.scripts?.lint) {
    run('npm', ['run', 'lint'], projectDir)
  }

  if (packageJson.scripts?.build) {
    run('npm', ['run', 'build'], projectDir)
  }
  else if (existsSync(join(projectDir, 'tsconfig.json'))) {
    run('npx', ['tsc', '--noEmit'], projectDir)
  }

  if (packageJson.scripts?.test) {
    run('npm', ['run', 'test'], projectDir)
  }
  else if (packageJson.devDependencies?.vitest) {
    run('npx', ['vitest', 'run', '--passWithNoTests'], projectDir)
  }
  else if (packageJson.devDependencies?.jest) {
    run('npx', ['jest', '--passWithNoTests'], projectDir)
  }
}

async function main() {
  const workspaceDir = await mkdtemp(join(tmpdir(), 'create-hana-smoke-'))

  try {
    for (const smokeCase of smokeCases) {
      console.log(`\n[smoke] ${smokeCase.name}`)
      await runSmokeCase(workspaceDir, smokeCase)
    }
  }
  finally {
    await rm(workspaceDir, { recursive: true, force: true })
  }
}

await main()
