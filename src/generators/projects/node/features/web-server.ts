import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateWebServerSetup(context: ProjectContext) {
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
