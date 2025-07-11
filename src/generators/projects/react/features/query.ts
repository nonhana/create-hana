import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateQueryLibrary(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  packageJson.dependencies = packageJson.dependencies || {}

  switch (config.queryLibrary) {
    case 'react-query': {
      packageJson.dependencies['@tanstack/react-query'] = '^5.81.5'
      context.mainEditor!.addImport('main', `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'`)
      context.mainEditor!.addCode('main', `const queryClient = new QueryClient()`)
      context.mainEditor!.addJsxProvider('QueryClientProvider', { client: 'queryClient' })
      break
    }
    case 'swr': {
      packageJson.dependencies.swr = '^2.3.4'
      break
    }
  }
}
