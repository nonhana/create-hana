import type { Config } from '@/types'
import process from 'node:process'
import * as prompts from '@clack/prompts'
import { PROJECTS } from '@/constants/projectTypes'
import { generateProject } from '@/core/generator'
import { furtherQuestions } from './questions'

const cwd = process.cwd()

async function init() {
  const cancel = () => prompts.cancel('Operation cancelled')

  const config: Config = {}

  if (!config.targetDir) {
    const projectName = await prompts.text({
      message: 'Project name:',
      defaultValue: 'hana',
      placeholder: 'hana',
    })
    if (prompts.isCancel(projectName))
      return cancel()
    config.targetDir = projectName
  }

  if (!config.projectType) {
    const tempProjectType = await prompts.select({
      message: '您想创建什么项目？',
      options: PROJECTS.map(item => ({ ...item })),
    })
    if (prompts.isCancel(tempProjectType))
      return cancel()
    config.projectType = tempProjectType
  }

  await furtherQuestions(config)

  if (!config.git) {
    const git = await prompts.confirm({
      message: '要初始化为 git 仓库吗？',
      initialValue: false,
    })
    if (prompts.isCancel(git))
      return cancel()
    config.git = git
  }

  // await generateProject(config, cwd)

  prompts.outro(JSON.stringify(config, null, 2))
}

init().catch(e => console.error(e))
