import type { Config, Generator } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { viteTemplate } from '@/editor/templates'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'

export const viteGenerator: Generator = {
  generate(context) {
    addDependencies(context.packageJson, {
      vite: '^7.0.0',
    })

    addScripts(context.packageJson, {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    })
  },
}

export function generateViteConfigCode(config: Config) {
  if (config.projectType === 'node' || config.buildTool !== 'vite')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  return viteTemplate
}
