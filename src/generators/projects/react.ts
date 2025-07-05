import type { Generator } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'

export const reactGenerator: Generator = {
  generate(context) {
    const { config, fileExtension } = context
    if (config.projectType !== 'react')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    // const indexFileName = `src/index${fileExtension}`
    // context.files[indexFileName] = generateIndexFile()

    // const projectName = config.targetDir || 'my-project'
    // context.files['README.md'] = generateReadmeTemplate(projectName, 'A Node.js library')

    // context.files['.gitignore'] = generateGitignore()

    // context.packageJson.name = projectName
    // context.packageJson.description = 'A Node.js library'
    // context.packageJson.version = '1.0.0'
    // context.packageJson.license = 'MIT'
    // context.packageJson.engines = {
    //   node: '>=16.0.0',
    // }

    // if (config.language === 'typescript' && config.tsRuntimePkgs && config.tsRuntimePkgs !== 'none') {
    //   generateTypeScriptRuntime(context)
    // }

    // if (config.webserverPkgs && config.webserverPkgs !== 'none') {
    //   generateWebServerSetup(context)
    // }

    const mainFileName = `src/main${fileExtension}x`
    context.files[mainFileName] = generateMainFile()

    const appFileName = `src/App${fileExtension}`
    context.files[appFileName] = generateAppFile()

    context.files['vite-env.d.ts'] = generateViteEnvFile()
  },
}
