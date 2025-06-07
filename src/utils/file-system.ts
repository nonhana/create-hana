import type { ProjectContext } from '@/types'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { ErrorHandler } from './error'
import { logger } from './logger'

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(dirPath: string): Promise<void> {
  return ErrorHandler.tryAsync(async () => {
    const resolvedPath = resolve(dirPath)
    if (!existsSync(resolvedPath)) {
      await mkdir(resolvedPath, { recursive: true })
    }
  }, 'directory creation', undefined)
}

/**
 * Write file with automatic directory creation
 */
export async function writeFileWithDir(filePath: string, content: string): Promise<void> {
  return ErrorHandler.tryAsync(async () => {
    const dir = dirname(filePath)
    await ensureDir(dir)
    await writeFile(filePath, content, 'utf8')
  }, `writing file: ${filePath}`)
}

/**
 * Remove directory or file if exists
 */
export async function removeIfExists(path: string): Promise<void> {
  return ErrorHandler.tryAsync(async () => {
    if (existsSync(path)) {
      await rm(path, { recursive: true, force: true })
    }
  }, `removing path: ${path}`, undefined)
}

/**
 * Read template file content
 */
export async function readTemplate(templatePath: string): Promise<string> {
  return ErrorHandler.tryAsync(async () => {
    return await readFile(templatePath, 'utf8')
  }, `reading template: ${templatePath}`)
}

/**
 * Write all files from context to disk
 */
export async function writeProjectFiles(context: ProjectContext): Promise<void> {
  logger.step('Writing project files...')

  // Write package.json
  const packageJsonPath = join(context.projectDir, 'package.json')
  const packageJsonContent = JSON.stringify(context.packageJson, null, 2)
  await writeFileWithDir(packageJsonPath, packageJsonContent)

  // Write all other files
  for (const [relativePath, content] of Object.entries(context.files)) {
    const filePath = join(context.projectDir, relativePath)
    await writeFileWithDir(filePath, content)
  }

  logger.success(`Generated ${Object.keys(context.files).length + 1} files`)
}
