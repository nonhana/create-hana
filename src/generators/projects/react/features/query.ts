import type { ReactMainEditorType } from '@/editor'
import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset } from '@/utils/package-json'

export function generateQueryLibrary(context: ProjectContext) {
  const { config } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  switch (config.queryLibrary) {
    case 'react-query': {
      addDependencyPreset(context.packageJson, 'feature.react.query.react-query')
      context.mainEditor!.addImport('main', `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'`)
      context.mainEditor!.addCode('main', `const queryClient = new QueryClient()`)
      ;(context.mainEditor! as ReactMainEditorType).addJsxProvider('QueryClientProvider', { client: 'queryClient' })
      break
    }
    case 'swr': {
      addDependencyPreset(context.packageJson, 'feature.react.query.swr')
      break
    }
  }
}
