import type { Config, ProjectContext } from '@/types'
import { join } from 'node:path'
import { ErrorMessages } from '@/constants/errors'
import { createMainEditor, createViteConfigEditor } from '@/editor'
import { mainReactTemplate, mainRouterProviderTemplate, viteTemplate } from '@/editor/templates'
import { ErrorFactory } from '@/error/factory'
import { ErrorHandler } from '@/error/handler'
import { viteGenerator } from '@/generators/build-tools'
import { biomeGenerator, eslintGenerator, eslintPrettierGenerator } from '@/generators/features'
import { languageGenerator } from '@/generators/language'
import { nodeGenerator, reactGenerator } from '@/generators/projects'
import { initGitRepository } from '@/handlers/git'
import { installDependencies } from '@/handlers/package-manager'
import { removeIfExists, writeProjectFiles } from '@/utils/file-system'
import { logger } from '@/utils/logger'
import { sortPackageJson } from '@/utils/package-json'
import { getFileExtension } from '@/utils/template'

export async function generateProject(config: Config, cwd: string) {
  return ErrorHandler.tryAsync(async () => {
    validateConfig(config)

    const context = await initializeProjectContext(config, cwd)

    logger.info(`Creating ${config.projectType} project in ${config.targetDir}`)

    if (config.removeExistFolder) {
      await removeIfExists(context.projectDir)
      logger.info(`Removed existing folder: ${context.projectDir}`)
    }

    await runGenerators(context)

    saveEditors(context)

    await writeProjectFiles(context)

    if (config.git) {
      await initGitRepository(context.projectDir)
    }

    if (shouldInstallDependencies(context)) {
      await installDependencies(config, context.projectDir)
    }

    showCompletionMessage(context)
  }, 'project generation')
}

function validateConfig(config: Config) {
  if (!config.targetDir) {
    throw ErrorFactory.validation(ErrorMessages.validation.targetDirRequired())
  }

  if (!config.projectType) {
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  }
}

async function initializeProjectContext(config: Config, cwd: string) {
  const projectDir = join(cwd, config.targetDir!)
  const language = config.language || 'typescript'

  const context: ProjectContext = {
    config,
    projectDir,
    cwd,
    packageJson: {
      name: config.targetDir!,
      version: '1.0.0',
      type: 'module',
    },
    files: {},
    fileExtension: getFileExtension(language),
  }

  // Global editor context
  if (config.projectType !== 'node' && config.buildTool === 'vite') {
    context.viteConfigEditor = createViteConfigEditor(viteTemplate())
  }
  if (config.projectType === 'react') {
    if (config.routingLibrary === 'react-router' || config.routingLibrary === 'tanstack-router') {
      context.mainEditor = createMainEditor(mainRouterProviderTemplate(config.routingLibrary))
    }
    else {
      context.mainEditor = createMainEditor(mainReactTemplate(context.fileExtension))
    }
  }

  return context
}

async function runGenerators(context: ProjectContext) {
  const { config } = context

  logger.step('Running generators...')

  languageGenerator.generate(context)

  if (config.projectType === 'node') {
    nodeGenerator.generate(context)
  }
  else if (config.projectType === 'react') {
    if (config.buildTool === 'vite') {
      viteGenerator.generate(context)
    }
    reactGenerator.generate(context)
  }

  if (config.codeQualityTools) {
    switch (config.codeQualityTools) {
      case 'eslint':
        eslintGenerator.generate(context)
        break
      case 'eslint-prettier':
        eslintPrettierGenerator.generate(context)
        break
      case 'biome':
        biomeGenerator.generate(context)
        break
    }
  }

  context.packageJson = sortPackageJson(context.packageJson)

  logger.success('Generators completed')
}

function saveEditors(context: ProjectContext) {
  if (context.viteConfigEditor) {
    context.files[`vite.config.${context.fileExtension}`] = context.viteConfigEditor.getContent('viteConfig')
  }
  if (context.mainEditor) {
    const suffix = context.config.projectType === 'react'
      ? `${context.fileExtension}x`
      : context.fileExtension
    context.files[`main.${suffix}`] = context.mainEditor.getContent('main')
  }
}

function shouldInstallDependencies(context: ProjectContext) {
  const { config, packageJson } = context

  return Boolean(
    config.installDeps
    && ((packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0)
      || (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0)),
  )
}

function showCompletionMessage(context: ProjectContext) {
  const { config, packageJson } = context
  const projectName = config.targetDir!

  logger.success(`Project ${projectName} created successfully!`)
  logger.nextLine()
  logger.info('Next steps:')
  logger.log(`  cd ${projectName}`)

  if (!config.installDeps) {
    logger.log(`  ${config.pkgManager || 'npm'} install`)
  }

  if (packageJson.scripts) {
    const pkgManager = config.pkgManager || 'npm'
    const runCommand = pkgManager === 'npm' ? ' run' : ''

    if (packageJson.scripts.dev) {
      logger.log(`  ${pkgManager}${runCommand} dev`)
    }
    else if (packageJson.scripts.start) {
      logger.log(`  ${pkgManager}${runCommand} start`)
    }

    if (packageJson.scripts.build) {
      logger.log(`  ${pkgManager}${runCommand} build`)
    }
  }
}
