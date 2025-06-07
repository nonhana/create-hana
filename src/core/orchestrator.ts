import type { Config, ProjectContext } from '@/types'
import { join } from 'node:path'
import { ErrorMessages } from '@/constants/errors'
import { bundlerGenerator } from '@/generators/bundler'
import { biomeGenerator, eslintGenerator, eslintPrettierGenerator } from '@/generators/features'
// Import generators
import { languageGenerator } from '@/generators/language'
import { nodeLibGenerator } from '@/generators/project-type/node-lib'

import { initGitRepository, installDependencies } from '@/handlers/package-manager'
import { ErrorFactory, ErrorHandler } from '@/utils/error'
import { removeIfExists, writeProjectFiles } from '@/utils/file-system'
import { logger } from '@/utils/logger'
import { sortPackageJson } from '@/utils/package-json'

/**
 * Main orchestrator for project generation
 */
export async function generateProject(config: Config, cwd: string): Promise<void> {
  return ErrorHandler.tryAsync(async () => {
    // Validate configuration
    validateConfig(config)

    // Initialize project context
    const context = await initializeProjectContext(config, cwd)

    logger.info(`Creating ${config.projectType} project: ${config.targetDir}`)

    // Clean up existing directory if needed
    await removeIfExists(context.projectDir)

    // Run generators in sequence
    await runGenerators(context)

    // Write all files to disk
    await writeProjectFiles(context)

    // Install dependencies
    if (shouldInstallDependencies(context)) {
      await installDependencies(config, context.projectDir)
    }

    // Initialize Git repository if requested
    if (config.git) {
      await initGitRepository(context.projectDir)
    }

    // Show completion message
    showCompletionMessage(context)
  }, 'project generation')
}

/**
 * Validate project configuration
 */
function validateConfig(config: Config): void {
  if (!config.targetDir) {
    throw ErrorFactory.validation(ErrorMessages.validation.targetDirRequired())
  }

  if (!config.projectType) {
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  }

  if (config.projectType !== 'node') {
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))
  }
}

/**
 * Initialize project context
 */
async function initializeProjectContext(config: Config, cwd: string): Promise<ProjectContext> {
  const projectDir = join(cwd, config.targetDir!)

  const context: ProjectContext = {
    config,
    projectDir,
    cwd,
    packageJson: {
      name: config.targetDir!,
      version: '1.0.0',
    },
    files: {},
    fileExtension: '.js', // Will be updated by language generator
  }

  return context
}

/**
 * Run all applicable generators
 */
async function runGenerators(context: ProjectContext): Promise<void> {
  const { config } = context

  logger.step('Running generators...')

  // 1. Language generator (sets up TypeScript/JavaScript)
  languageGenerator.generate(context)

  // 2. Project type generator
  if (config.projectType === 'node') {
    nodeLibGenerator.generate(context)
  }

  // 3. Code quality tools generators
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

  // 4. Bundler generator (for TypeScript projects)
  if (config.language === 'typescript') {
    bundlerGenerator.generate(context)
  }

  // 5. Sort package.json for consistent output
  context.packageJson = sortPackageJson(context.packageJson)

  logger.success('Generators completed')
}

/**
 * Determine if dependencies should be installed
 */
function shouldInstallDependencies(context: ProjectContext): boolean {
  const { config, packageJson } = context

  return Boolean(
    config.installDeps
    && ((packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0)
      || (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0)),
  )
}

/**
 * Show completion message with next steps
 */
function showCompletionMessage(context: ProjectContext): void {
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
