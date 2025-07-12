import type { Generator } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'
import { generateBundlerConfig } from './features/bundler'
import { generateTypeScriptRuntime } from './features/ts-runtime'
import { generateWebServerSetup } from './features/web-server'

export const nodeGenerator: Generator = {
  generate(context) {
    const { config, fileExtension } = context
    if (!config.projectType)
      throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
    if (config.projectType !== 'node')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const indexFileName = `src/index${fileExtension}`
    context.files[indexFileName] = generateIndexFile()

    const projectName = config.targetDir || 'my-project'
    context.files['README.md'] = generateReadmeTemplate(config.projectType, projectName, 'A Node.js library')

    context.files['.gitignore'] = generateGitignore()

    context.packageJson.name = projectName
    context.packageJson.description = 'A Node.js library'
    context.packageJson.version = '1.0.0'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=16.0.0',
    }

    if (config.language === 'typescript' && config.tsRuntimePkgs && config.tsRuntimePkgs !== 'none') {
      generateTypeScriptRuntime(context)
    }

    if (config.webserverPkgs && config.webserverPkgs !== 'none') {
      generateWebServerSetup(context)
    }

    if (config.bundler && config.bundler !== 'none') {
      generateBundlerConfig(context)
    }
  },
}

function generateIndexFile() {
  return `export function hello(name = 'World') {
  return \`Hello, \${name}!\`
}

export default {
  hello,
}
`
}
