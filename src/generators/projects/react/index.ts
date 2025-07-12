import type { Generator } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies } from '@/utils/package-json'
import { generateGitignore, generateHanaLogo, generateReadmeTemplate, generateSPAHtmlTemplate, generateViteEnvFile } from '@/utils/template'
import { generateAlias } from './features/alias'
import { generateCssFramework } from './features/css-framework'
import { generateCssPreprocessor } from './features/css-preprocessor'
import { generateHttpLibrary } from './features/http'
import { generateQueryLibrary } from './features/query'
import { generateRoutingLibrary } from './features/route'
import { generateStateManagement } from './features/state-management'

export const reactGenerator: Generator = {
  generate(context) {
    const { config, fileExtension, packageJson } = context
    if (!config.projectType)
      throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
    if (config.projectType !== 'react')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const projectName = config.targetDir || 'hana-project'

    addDependencies(packageJson, {
      'react': '^19.1.0',
      'react-dom': '^19.1.0',
      '@types/react': '^19.1.8',
      '@types/react-dom': '^19.1.6',
    })

    if (config.buildTool === 'vite') {
      addDependencies(packageJson, { '@vitejs/plugin-react': '^4.6.0' })
      context.viteConfigEditor!.addImport('viteConfig', `import react from '@vitejs/plugin-react'`)
      context.viteConfigEditor!.addVitePlugin(`react()`)
    }

    // 1. Generate src directory structure
    const appFileName = `src/app${fileExtension}x`
    // if routing library is react-router or tanstack-router, we use <RouterProvider /> instead of <App />
    if (config.routingLibrary === 'wouter' || config.routingLibrary === 'none') {
      context.files[appFileName] = generateAppFile(config.routingLibrary)
    }

    const counterFileName = `src/components/counter${fileExtension}x`
    context.files[counterFileName] = generateCounterFile()

    if (config.language === 'typescript') {
      context.files['src/vite-env.d.ts'] = generateViteEnvFile()
    }

    // 2. Generate root files
    context.files['public/favicon.svg'] = generateHanaLogo()

    context.files['index.html'] = generateSPAHtmlTemplate({
      title: 'react project',
      bodyId: 'root',
      mainScriptPath: `/src/main${fileExtension}x`,
    })

    context.files['README.md'] = generateReadmeTemplate(
      config.projectType,
      projectName,
      'A React project',
    )

    context.files['.gitignore'] = generateGitignore()

    // 3. Modify package.json
    context.packageJson.name = projectName
    context.packageJson.description = 'A React project'
    context.packageJson.version = '1.0.0'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=18.12.0', // V18 LTS
    }

    // 4. Features
    if (config.cssFramework && config.cssFramework !== 'none') {
      generateCssFramework(context)
    }
    if (config.cssPreprocessor) {
      generateCssPreprocessor(context)
    }
    if (config.routingLibrary && config.routingLibrary !== 'none') {
      generateRoutingLibrary(context)
    }
    if (config.stateManagement && config.stateManagement !== 'none') {
      generateStateManagement(context)
    }
    if (config.httpLibrary && config.httpLibrary !== 'none') {
      generateHttpLibrary(context)
    }
    if (config.queryLibrary && config.queryLibrary !== 'none') {
      generateQueryLibrary(context)
    }
    if (config.modulePathAliasing && config.modulePathAliasing !== 'none') {
      generateAlias(context)
    }
  },
}

/* File generators */

function generateAppFile(type: string) {
  if (type === 'wouter') {
    return `import { Route } from 'wouter'
import { Home } from './pages/home'

export default function App() {
  return (
    <>
      <Route path="/"><Home /></Route>
    </>
  )
}
`
  }
  else {
    return `export default function App() {
  return (
    <h1>Hello, vite + react</h1>
  )
}
`
  }
}

function generateCounterFile() {
  return `import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>
        Count:
        {count}
      </h1>
      <button type="button" onClick={() => setCount(count + 1)}>+</button>
      <button type="button" onClick={() => setCount(count - 1)}>-</button>
    </div>
  )
}
`
}
