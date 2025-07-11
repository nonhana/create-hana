import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateAlias(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  packageJson.dependencies = packageJson.dependencies || {}

  context.viteConfigEditor!.addImport('viteConfig', `import path from 'node:path'`)

  switch (config.modulePathAliasing) {
    case '@': {
      if (config.buildTool === 'vite') {
        context.viteConfigEditor!.addViteAlias({
          '@': 'path.resolve(__dirname, "src")',
        })
      }
      break
    }
    case '~': {
      if (config.buildTool === 'vite') {
        context.viteConfigEditor!.addViteAlias({
          '~': 'path.resolve(__dirname, "src")',
        })
      }
      break
    }
  }
}
