import { spawn } from 'node:child_process'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { ErrorHandler } from '@/error/handler'
import { logger } from '@/utils/logger'

export async function initGitRepository(projectDir: string) {
  logger.step('Initializing Git repository...')

  return new Promise<void>((resolve) => {
    const child = spawn('git', ['init'], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
    })

    child.on('error', (error) => {
      ErrorHandler.handleGracefully(
        ErrorFactory.system(ErrorMessages.git.initFailed(), { projectDir }, error),
        'git initialization',
      )
      resolve()
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
