import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateCssPreprocessor(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  switch (config.cssPreprocessor) {
    case 'less': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.less = '^4.3.0'
      break
    }
    case 'scss': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.sass = '^1.89.2'
      break
    }
  }
}
