import type { Config, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies } from '@/utils/package-json'

export function generateHonoTSConfig(context: ProjectContext) {
  const { config, packageJson } = context

  addDependencies(packageJson, {
    'typescript': 'latest',
    '@types/node': 'latest',
  }, 'devDependencies')

  context.files['tsconfig.json'] = generateTsConfigFile(config)
}

function generateTsConfigFile(config: Config) {
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'hono')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const tsConfig: Record<string, any> = {
    compilerOptions: {
      target: 'ES2023',
      lib: ['ES2023'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      noFallthroughCasesInSwitch: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noEmit: true,
      verbatimModuleSyntax: true,
      skipLibCheck: true,
    },
    include: ['src'],
  }

  if (config.modulePathAliasing && config.modulePathAliasing !== 'none') {
    tsConfig.compilerOptions.baseUrl = './'
    tsConfig.compilerOptions.paths = {
      [`${config.modulePathAliasing}/*`]: ['src/*'],
    }
  }

  return JSON.stringify(tsConfig, null, 2)
}
