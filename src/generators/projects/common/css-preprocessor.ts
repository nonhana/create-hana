import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset } from '@/utils/package-json'

export function generateCssPreprocessor(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'react' && config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  switch (config.cssPreprocessor) {
    case 'less': {
      addDependencyPreset(packageJson, 'feature.css-preprocessor.less')
      break
    }
    case 'scss': {
      addDependencyPreset(packageJson, 'feature.css-preprocessor.scss')
      break
    }
  }
}
