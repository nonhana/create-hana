import type { Config, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies } from '@/utils/package-json'

export function generateVueTSConfig(context: ProjectContext) {
  const { config, packageJson } = context

  addDependencies(packageJson, {
    'typescript': 'latest',
    '@types/node': 'latest',
    '@vue/tsconfig': '^0.7.0',
    'vue-tsc': 'latest',
  }, 'devDependencies')

  context.files['tsconfig.json'] = generateTsConfigFile(config)
}

function generateTsConfigFile(config: Config) {
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const tsConfig: Record<string, any> = {
    extends: '@vue/tsconfig/tsconfig.dom.json',
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',

      /* Linting */
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      erasableSyntaxOnly: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    },
    include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
  }

  // Add path aliasing support
  if (config.modulePathAliasing && config.modulePathAliasing !== 'none') {
    tsConfig.compilerOptions.baseUrl = './'
    tsConfig.compilerOptions.paths = {
      [`${config.modulePathAliasing}/*`]: ['src/*'],
    }
  }

  return JSON.stringify(tsConfig, null, 2)
}
