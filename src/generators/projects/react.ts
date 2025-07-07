import type { Generator, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { generateGitignore, generateHanaLogo, generateHtmlTemplate, generateReadmeTemplate, generateViteEnvFile } from '@/utils/template'

export const reactGenerator: Generator = {
  generate(context) {
    const { config, fileExtension } = context
    if (config.projectType !== 'react')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const projectName = config.targetDir || 'hana-project'

    // 1. Generate src directory structure
    const appFileName = `src/app${fileExtension}x`
    context.files[appFileName] = generateAppFile()

    const mainFileName = `src/main${fileExtension}x`
    context.files[mainFileName] = generateMainFile(appFileName)

    const counterFileName = `src/components/counter.${fileExtension}x`
    context.files[counterFileName] = generateCounterFile()

    if (config.language === 'typescript') {
      context.files['src/vite-env.d.ts'] = generateViteEnvFile()
    }

    // 2. Generate root files
    context.files['public/favicon.svg'] = generateHanaLogo()

    context.files['index.html'] = generateHtmlTemplate(
      'react project',
      `/${mainFileName}`,
    )

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

    // 4. Generate feature files
    if (config.cssFramework && config.cssFramework !== 'none') {
      generateCssFramework(context)
    }
  },
}

function generateAppFile() {
  return `function App() {
  return (
    <h1>Hello, vite + react</h1>
  )
}

export default App
`
}

function generateMainFile(appFileName: string) {
  return `import { createRoot } from 'react-dom/client'
import App from './${appFileName}'

createRoot(document.getElementById('root')!).render(<App />)
`
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

// Handle CSS Framework option
function generateCssFramework(context: ProjectContext) {
  const { config } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))
}
