import type { Config } from '@/types'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory, ErrorHandler } from '@/utils/error'
import { logger } from '@/utils/logger'

/**
 * Package manager interface
 */
interface PackageManager {
  name: string
  command: string
  installArgs: string[]
  lockFile: string
}

/**
 * Available package managers
 */
const PACKAGE_MANAGERS: Record<string, PackageManager> = {
  npm: {
    name: 'npm',
    command: 'npm',
    installArgs: ['install'],
    lockFile: 'package-lock.json',
  },
  yarn: {
    name: 'Yarn',
    command: 'yarn',
    installArgs: ['install'],
    lockFile: 'yarn.lock',
  },
  pnpm: {
    name: 'pnpm',
    command: 'pnpm',
    installArgs: ['install'],
    lockFile: 'pnpm-lock.yaml',
  },
  bun: {
    name: 'Bun',
    command: 'bun',
    installArgs: ['install'],
    lockFile: 'bun.lockb',
  },
}

/**
 * Detect package manager from lock files
 */
export function detectPackageManager(cwd: string): string | null {
  for (const [name, pm] of Object.entries(PACKAGE_MANAGERS)) {
    const lockPath = join(cwd, pm.lockFile)
    if (existsSync(lockPath)) {
      return name
    }
  }
  return null
}

/**
 * Get package manager configuration
 */
export function getPackageManager(config: Config, cwd: string): PackageManager {
  // Use user specified package manager
  if (config.pkgManager && PACKAGE_MANAGERS[config.pkgManager]) {
    return PACKAGE_MANAGERS[config.pkgManager]!
  }

  // Try to detect from lock files
  const detected = detectPackageManager(cwd)
  if (detected) {
    return PACKAGE_MANAGERS[detected]!
  }

  // Default to npm
  return PACKAGE_MANAGERS.npm!
}

/**
 * Install dependencies using the specified package manager
 */
export async function installDependencies(config: Config, projectDir: string): Promise<void> {
  return ErrorHandler.tryAsync(async () => {
    const packageManager = getPackageManager(config, projectDir)

    logger.step(`Installing dependencies with ${packageManager.name}...`)

    return new Promise<void>((resolve, reject) => {
      const child = spawn(packageManager.command, packageManager.installArgs, {
        cwd: projectDir,
        stdio: 'inherit',
        shell: true,
      })

      child.on('error', (error) => {
        const hanaError = ErrorFactory.dependency(
          ErrorMessages.dependency.installFailed(packageManager.name),
          { packageManager: packageManager.name, projectDir },
          error,
        )
        reject(hanaError)
      })

      child.on('close', (code) => {
        if (code === 0) {
          logger.success('Dependencies installed successfully')
          resolve()
        }
        else {
          const hanaError = ErrorFactory.dependency(
            ErrorMessages.dependency.installFailed(packageManager.name),
            { packageManager: packageManager.name, exitCode: code, projectDir },
          )
          reject(hanaError)
        }
      })
    })
  }, `dependency installation with ${getPackageManager(config, projectDir).name}`)
}

/**
 * Initialize git repository
 */
export async function initGitRepository(projectDir: string): Promise<void> {
  logger.step('Initializing Git repository...')

  return new Promise<void>((resolve) => {
    const child = spawn('git', ['init'], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
    })

    child.on('error', (error) => {
      // Use graceful error handling for git init since it's not critical
      ErrorHandler.handleGracefully(
        ErrorFactory.system(ErrorMessages.git.initFailed(), { projectDir }, error),
        'git initialization',
      )
      resolve() // Don't fail the whole process for git init
    })

    child.on('close', (code) => {
      if (code === 0) {
        logger.success('Git repository initialized')
      }
      else {
        ErrorHandler.handleGracefully(
          ErrorFactory.system(ErrorMessages.git.initFailed(), { exitCode: code, projectDir }),
          'git initialization',
        )
      }
      resolve()
    })
  })
}
