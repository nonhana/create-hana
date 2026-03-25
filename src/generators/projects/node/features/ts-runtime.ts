import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset } from '@/utils/package-json'

export function generateTypeScriptRuntime(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const runtime = config.tsRuntimePkgs!

  switch (runtime) {
    case 'tsx': {
      addDependencyPreset(packageJson, 'feature.node.runtime.tsx')
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'tsx src/index.ts'
      packageJson.scripts['dev:watch'] = 'tsx src/index.ts --watch'
      break
    }
    case 'ts-node': {
      addDependencyPreset(packageJson, 'feature.node.runtime.ts-node')
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'ts-node src/index.ts'
      packageJson.scripts['dev:watch'] = 'ts-node src/index.ts --watch'
      break
    }
    case 'esno': {
      addDependencyPreset(packageJson, 'feature.node.runtime.esno')
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'esno src/index.ts'
      packageJson.scripts['dev:watch'] = 'esno src/index.ts --watch'
      break
    }
  }
}
