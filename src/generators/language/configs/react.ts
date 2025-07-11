import type { Config, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies } from '@/utils/package-json'

export function generateReactTSConfig(context: ProjectContext) {
  const { config, packageJson } = context

  addDependencies(packageJson, {
    'typescript': 'latest',
    '@types/node': 'latest',
  }, 'devDependencies')

  context.files['tsconfig.json'] = generateTsConfigFile(config)
}

function generateTsConfigFile(config: Config) {
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const tsConfig: Record<string, any> = {
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.tsbuildinfo',
      target: 'ES2023',
      jsx: 'react-jsx',
      lib: ['ES2023', 'DOM', 'DOM.Iterable'],
      moduleDetection: 'force',
      useDefineForClassFields: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      strict: true,
      noFallthroughCasesInSwitch: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noEmit: true,
      verbatimModuleSyntax: true,
      erasableSyntaxOnly: true,
      noUncheckedSideEffectImports: true,
      skipLibCheck: true,
    },
    include: ['src', 'vite.config.ts'],
  }

  if (config.modulePathAliasing && config.modulePathAliasing !== 'none') {
    tsConfig.compilerOptions.baseUrl = './'
    tsConfig.compilerOptions.paths = {
      [`${config.modulePathAliasing}/*`]: ['src/*'],
    }
  }

  return JSON.stringify(tsConfig, null, 2)
}
