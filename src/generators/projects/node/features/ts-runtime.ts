import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateTypeScriptRuntime(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const runtime = config.tsRuntimePkgs!

  switch (runtime) {
    case 'tsx': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.tsx = '^4.19.4'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'tsx src/index.ts'
      packageJson.scripts['dev:watch'] = 'tsx src/index.ts --watch'
      break
    }
    case 'ts-node': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies['ts-node'] = '^10.9.2'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'ts-node src/index.ts'
      packageJson.scripts['dev:watch'] = 'ts-node src/index.ts --watch'
      break
    }
    case 'esno': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.esno = '^4.8.0'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts.dev = 'esno src/index.ts'
      packageJson.scripts['dev:watch'] = 'esno src/index.ts --watch'
      break
    }
  }
}
