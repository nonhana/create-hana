import type { Generator, ProjectContext } from '@/types'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'

/**
 * Node.js library project generator
 */
export const nodeLibGenerator: Generator = {
  generate(context) {
    const { config, fileExtension } = context

    // Generate main entry file
    const indexFileName = `src/index${fileExtension}`
    context.files[indexFileName] = generateIndexFile(config.language || 'typescript')

    // Generate README.md
    const projectName = config.targetDir || 'my-project'
    context.files['README.md'] = generateReadmeTemplate(projectName, 'A Node.js library')

    // Generate .gitignore
    context.files['.gitignore'] = generateGitignore()

    // Set basic package.json fields
    context.packageJson.name = projectName
    context.packageJson.description = 'A Node.js library'
    context.packageJson.version = '1.0.0'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=16.0.0',
    }

    // Generate TypeScript runtime setup if needed
    if (config.language === 'typescript' && config.tsRuntimePkgs && config.tsRuntimePkgs !== 'none') {
      generateTypeScriptRuntime(context)
    }

    // Generate web server setup if requested
    if (config.webserverPkgs && config.webserverPkgs !== 'none') {
      generateWebServerSetup(context)
    }
  },
}

/**
 * Generate main index file content
 */
function generateIndexFile(language: 'typescript' | 'javascript') {
  if (language === 'typescript') {
    return `/**
 * Main entry point for the library
 */

/**
 * A simple hello function
 */
export function hello(name: string = 'World'): string {
  return \`Hello, \${name}!\`
}

/**
 * Default export
 */
export default {
  hello,
}
`
  }
  else {
    return `/**
 * Main entry point for the library
 */

/**
 * A simple hello function
 */
function hello(name = 'World') {
  return \`Hello, \${name}!\`
}

module.exports = {
  hello,
}
`
  }
}

/**
 * Generate TypeScript runtime configuration
 */
function generateTypeScriptRuntime(context: ProjectContext) {
  const { config, packageJson } = context
  const runtime = config.tsRuntimePkgs!

  switch (runtime) {
    case 'tsx': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.tsx = '^4.0.0'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts['dev:ts'] = 'tsx src/index.ts'
      packageJson.scripts['start:ts'] = 'tsx src/index.ts'
      break
    }
    case 'ts-node': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies['ts-node'] = '^10.0.0'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts['dev:ts'] = 'ts-node src/index.ts'
      packageJson.scripts['start:ts'] = 'ts-node src/index.ts'
      break
    }
    case 'esno': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.esno = '^4.0.0'
      packageJson.scripts = packageJson.scripts || {}
      packageJson.scripts['dev:ts'] = 'esno src/index.ts'
      packageJson.scripts['start:ts'] = 'esno src/index.ts'
      break
    }
  }
}

/**
 * Generate web server setup
 */
function generateWebServerSetup(context: ProjectContext) {
  const { config, fileExtension } = context
  const framework = config.webserverPkgs!

  if (framework === 'express') {
    generateExpressSetup(context, fileExtension)
  }
  else if (framework === 'fastify') {
    generateFastifySetup(context, fileExtension)
  }
}

/**
 * Generate Express.js setup
 */
function generateExpressSetup(context: ProjectContext, fileExtension: string) {
  const { packageJson } = context

  // Add Express dependencies
  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies.express = '^4.18.0'

  if (fileExtension === '.ts') {
    packageJson.devDependencies = packageJson.devDependencies || {}
    packageJson.devDependencies['@types/express'] = '^4.17.0'
  }

  // Generate Express server file
  const serverContent = fileExtension === '.ts'
    ? generateExpressServerTypeScript()
    : generateExpressServerJavaScript()

  context.files[`src/server${fileExtension}`] = serverContent
}

/**
 * Generate Fastify setup
 */
function generateFastifySetup(context: ProjectContext, fileExtension: string) {
  const { packageJson } = context

  // Add Fastify dependencies
  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies.fastify = '^4.0.0'

  // Generate Fastify server file
  const serverContent = fileExtension === '.ts'
    ? generateFastifyServerTypeScript()
    : generateFastifyServerJavaScript()

  context.files[`src/server${fileExtension}`] = serverContent
}

/**
 * Generate Express server TypeScript content
 */
function generateExpressServerTypeScript() {
  return `import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`)
})
`
}

/**
 * Generate Express server JavaScript content
 */
function generateExpressServerJavaScript() {
  return `const express = require('express')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' })
})

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`)
})
`
}

/**
 * Generate Fastify server TypeScript content
 */
function generateFastifyServerTypeScript() {
  return `import Fastify from 'fastify'

const fastify = Fastify({
  logger: true,
})

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify!' }
})

const start = async (): Promise<void> => {
  try {
    const port = Number(process.env.PORT) || 3000
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

/**
 * Generate Fastify server JavaScript content
 */
function generateFastifyServerJavaScript() {
  return `const fastify = require('fastify')({
  logger: true,
})

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify!' }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000
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
