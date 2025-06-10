import type { ProjectContext } from '@/types'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { ErrorHandler } from '@/error/handler'
import { logger } from './logger'

export async function ensureDir(dirPath: string) {
  return ErrorHandler.tryAsync(async () => {
    const resolvedPath = resolve(dirPath)
    if (!existsSync(resolvedPath)) {
      await mkdir(resolvedPath, { recursive: true })
    }
  }, 'directory creation')
}

export async function writeFileWithDir(filePath: string, content: string) {
  return ErrorHandler.tryAsync(async () => {
    const dir = dirname(filePath)
    await ensureDir(dir)
    await writeFile(filePath, content, 'utf8')
  }, `writing file: ${filePath}`)
}

export async function removeIfExists(path: string) {
  return ErrorHandler.tryAsync(async () => {
    if (existsSync(path)) {
      await rm(path, { recursive: true, force: true })
    }
  }, `removing path: ${path}`)
}

export async function readTemplate(templatePath: string) {
  return ErrorHandler.tryAsync(async () => {
    return await readFile(templatePath, 'utf8')
  }, `reading template: ${templatePath}`)
}

export async function writeProjectFiles(context: ProjectContext) {
  logger.step('Writing project files...')

  const packageJsonPath = join(context.projectDir, 'package.json')
  const packageJsonContent = JSON.stringify(context.packageJson, null, 2)
  await writeFileWithDir(packageJsonPath, packageJsonContent)

  for (const [relativePath, content] of Object.entries(context.files)) {
    const filePath = join(context.projectDir, relativePath)
    await writeFileWithDir(filePath, content)
  }

  logger.success(`Generated ${Object.keys(context.files).length + 1} files`)
}
