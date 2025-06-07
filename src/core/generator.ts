import type { Config } from '@/types'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

export async function generateProject(config: Config, cwd: string) {
  const templatesPath = join(__dirname, '../../templates')

  if (!config.targetDir)
    throw new Error('创建失败：未指定目标目录')
  const finalDir = join(cwd, config.targetDir)
  const exist = existsSync(finalDir)
  if (exist)
    await rm(finalDir, { recursive: true, force: true })
  await mkdir(finalDir)

  if (!config.projectType)
    throw new Error('创建失败：未指定目标项目类型')
  const targetTemplatePath = join(templatesPath, config.projectType)
  const templateContent = await readdir(targetTemplatePath, { withFileTypes: true })

  for (const fileItem of templateContent) {
    const srcPath = join(targetTemplatePath, fileItem.name)
    const destPath = join(finalDir, fileItem.name)
    await copyFile(srcPath, destPath)
  }
}
