import type { Config } from '@/types'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ErrorMessages } from '@/constants/errors'
import { PACKAGE_MANAGERS } from '@/constants/package-managers'
import { ErrorFactory } from '@/error/factory'
import { ErrorHandler } from '@/error/handler'
import { logger } from '@/utils/logger'

export function detectPackageManager(cwd: string) {
  for (const [name, pm] of Object.entries(PACKAGE_MANAGERS)) {
    const lockPath = join(cwd, pm.lockFile)
    if (existsSync(lockPath)) {
      return name
    }
  }
  return null
}

export function getPackageManager(config: Config, cwd: string) {
  if (config.pkgManager && PACKAGE_MANAGERS[config.pkgManager]) {
    return PACKAGE_MANAGERS[config.pkgManager]!
  }

  const detected = detectPackageManager(cwd)
  if (detected) {
    return PACKAGE_MANAGERS[detected]!
  }

  return PACKAGE_MANAGERS.npm!
}

export async function installDependencies(config: Config, projectDir: string) {
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
