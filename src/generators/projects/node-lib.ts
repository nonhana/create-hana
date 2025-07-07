import type { Generator, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'

export const nodeLibGenerator: Generator = {
  generate(context) {
    const { config, fileExtension } = context
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

function generateTypeScriptRuntime(context: ProjectContext) {
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

function generateWebServerSetup(context: ProjectContext) {
  const { config, fileExtension } = context
  if (config.projectType !== 'node')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const framework = config.webserverPkgs!

  if (framework === 'express') {
    generateExpressSetup(context, fileExtension)
  }
  else if (framework === 'fastify') {
    generateFastifySetup(context, fileExtension)
  }
}

function generateExpressSetup(context: ProjectContext, fileExtension: string) {
  const { packageJson } = context

  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies.express = '^5.1.0'

  if (fileExtension === '.ts') {
    packageJson.devDependencies = packageJson.devDependencies || {}
    packageJson.devDependencies['@types/express'] = '^5.0.3'
  }

  const serverContent = generateExpressServer()

  context.files[`src/server${fileExtension}`] = serverContent
}

function generateFastifySetup(context: ProjectContext, fileExtension: string) {
  const { packageJson } = context

  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies.fastify = '^5.3.3'

  const serverContent = generateFastifyServer()

  context.files[`src/server${fileExtension}`] = serverContent
}

function generateExpressServer() {
  return `import express from 'express'

const app = express()
const port = process.env.PORT ?? '3000'

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`)
})
`
}

function generateFastifyServer() {
  return `import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify!' }
})

const start = async () => {
  try {
    const port = process.env.PORT ?? '3000'
    await fastify.listen({ port })
    console.log(\`Server running on port \${port}\`)
  }
  catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
`
}
