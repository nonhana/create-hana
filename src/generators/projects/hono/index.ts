import type { Generator, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencies, addScripts } from '@/utils/package-json'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'

export const honoGenerator: Generator = {
  generate(context) {
    const { config, packageJson } = context
    if (!config.projectType)
      throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
    if (config.projectType !== 'hono')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const projectName = config.targetDir || 'hono-app'

    // base deps
    addDependencies(packageJson, {
      hono: '^4.6.10',
    })

    // runtime specific deps & scripts
    configureRuntime(context)

    // purpose templates
    generatePurposeTemplates(context)

    // validation
    configureValidation(context)

    // openapi if zod
    if (config.openapi && config.validationLibrary === 'zod') {
      addDependencies(packageJson, {
        'hono-zod-openapi': '^0.16.3',
        'zod-openapi': '^3.0.0',
      })
    }

    // database
    configureDatabase(context)

    // auth
    configureAuth(context)

    // middlewares
    configureMiddlewares(context)

    // testing
    configureTesting(context)

    // root files
    context.files['.gitignore'] = generateGitignore()
    context.files['README.md'] = generateReadmeTemplate(
      'hono',
      projectName,
      'A Hono.js project',
    )

    // package json basic
    context.packageJson.name = projectName
    context.packageJson.description = 'A Hono.js project'
    context.packageJson.version = '1.0.0'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=18.12.0',
    }
  },
}

function configureRuntime(context: ProjectContext) {
  const { config, packageJson, fileExtension } = context

  switch (config.runtime) {
    case 'node': {
      addDependencies(packageJson, { 'hono/serve': '*' })
      addScripts(packageJson, {
        dev: `tsx src/server.${fileExtension}`,
        start: `node dist/server.js`,
      })
      // ts runtime helper for dev
      addDependencies(packageJson, { tsx: 'latest' }, 'devDependencies')

      context.files[`src/server.${fileExtension}`] = generateNodeServerFile()
      context.files[`src/app.${fileExtension}`] = generateAppFile()
      break
    }
    case 'cloudflare-workers': {
      addDependencies(packageJson, { wrangler: 'latest' }, 'devDependencies')
      addScripts(packageJson, {
        dev: 'wrangler dev',
        start: 'wrangler start',
      })
      context.files[`src/index.${fileExtension}`] = generateCfWorkerEntry()
      context.files[`wrangler.toml`] = generateWranglerToml()
      break
    }
    case 'bun': {
      addScripts(packageJson, {
        dev: `bun run src/server.${fileExtension}`,
        start: `bun run dist/server.js`,
      })
      context.files[`src/server.${fileExtension}`] = generateNodeServerFile()
      context.files[`src/app.${fileExtension}`] = generateAppFile()
      break
    }
    case 'deno': {
      addScripts(packageJson, {
        dev: `deno run -A src/server.${fileExtension}`,
      })
      context.files[`src/server.${fileExtension}`] = generateDenoServerFile()
      context.files[`src/app.${fileExtension}`] = generateAppFile()
      break
    }
    case 'vercel': {
      context.files[`api/index.${fileExtension}`] = generateVercelEdgeEntry()
      context.files['vercel.json'] = generateVercelJson()
      break
    }
    case 'other':
    default: {
      context.files[`src/index.${fileExtension}`] = generateGenericEntryFile()
      break
    }
  }
}

function generatePurposeTemplates(context: ProjectContext) {
  const { config, fileExtension } = context
  if (config.purpose === 'rest') {
    context.files[`src/routes/index.${fileExtension}`] = `import { Hono } from 'hono'

export const router = new Hono()

router.get('/', c => c.text('Hello from Hono!'))
router.post('/users', async c => {
  const user = await c.req.json()
  return c.json({ id: 1, ...user })
})
`
  }
  else if (config.purpose === 'rpc') {
    context.files[`src/routes/rpc.${fileExtension}`] = `import { Hono } from 'hono'
export const router = new Hono()
router.get('/ping', c => c.json({ ok: true }))
`
  }
  else if (config.purpose === 'ssr') {
    context.files[`src/views/index.${fileExtension}x`] = `export default function Page() { return <div>Hello Hono SSR</div> }`
  }
}

function configureValidation(context: ProjectContext) {
  const { config, packageJson } = context
  switch (config.validationLibrary) {
    case 'zod':
      addDependencies(packageJson, { zod: '^3.23.8' })
      break
    case 'valibot':
      addDependencies(packageJson, { valibot: 'latest' })
      break
    case 'yup':
      addDependencies(packageJson, { yup: 'latest' })
      break
  }
}

function configureDatabase(context: ProjectContext) {
  const { config, packageJson } = context
  switch (config.database) {
    case 'prisma':
      addDependencies(packageJson, { 'prisma': 'latest', '@prisma/client': 'latest' }, 'devDependencies')
      context.files['prisma/schema.prisma'] = `datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }`
      break
    case 'drizzle':
      addDependencies(packageJson, { drizzle: 'latest' })
      context.files['drizzle.config.ts'] = `export default { schema: './src/db/schema.ts' }`
      context.files['src/db/schema.ts'] = `// define drizzle schema here`
      break
    case 'kysely':
      addDependencies(packageJson, { kysely: 'latest' })
      break
  }
}

function configureAuth(context: ProjectContext) {
  const { config, packageJson } = context
  switch (config.auth) {
    case 'jwt':
      addDependencies(packageJson, { 'hono/jwt': '*' })
      break
    case 'lucia':
      addDependencies(packageJson, { lucia: 'latest' })
      break
    case 'authjs':
      addDependencies(packageJson, { 'next-auth': 'latest' })
      break
    case 'basic':
      addDependencies(packageJson, { 'hono/basic-auth': '*' })
      break
  }
}

function configureMiddlewares(context: ProjectContext) {
  const { config, packageJson } = context
  const selected = config.middlewares || []
  if (selected.includes('cors'))
    addDependencies(packageJson, { 'hono/cors': '*' })
  if (selected.includes('secure-headers'))
    addDependencies(packageJson, { 'hono/secure-headers': '*' })
  if (selected.includes('rate-limiter'))
    addDependencies(packageJson, { 'hono/rate-limit': '*' })
  if (selected.includes('logger'))
    addDependencies(packageJson, { 'hono/logger': '*' })
}

function configureTesting(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.testFramework === 'vitest') {
    addDependencies(packageJson, { vitest: 'latest' }, 'devDependencies')
  }
  else if (config.testFramework === 'jest') {
    addDependencies(packageJson, { jest: 'latest' }, 'devDependencies')
  }
}

function generateAppFile() {
  return `import { Hono } from 'hono'

export const app = new Hono()

app.get('/', c => c.text('Hello Hono'))
`
}

function generateNodeServerFile() {
  return `import { serve } from 'hono/serve'
import { app } from './app'

serve(app)
`
}

function generateDenoServerFile() {
  return `import { Hono } from 'hono'
const app = new Hono()
app.get('/', c => c.text('Hello from Deno + Hono'))
export default app
`
}

function generateGenericEntryFile() {
  return `import { Hono } from 'hono'
const app = new Hono()
app.get('/', c => c.text('Hello Hono'))
export default app
`
}

function generateCfWorkerEntry() {
  return `import { Hono } from 'hono'
const app = new Hono()
app.get('/', c => c.text('Hello Cloudflare Workers + Hono'))
export default app
`
}

function generateWranglerToml() {
  return `name = "hono-app"\nmain = "src/index.ts"\ncompatibility_date = "2024-04-05"\n`
}

function generateVercelEdgeEntry() {
  return `import { Hono } from 'hono'
export const config = { runtime: 'edge' }
const app = new Hono()
app.get('/', c => c.text('Hello from Vercel Edge + Hono'))
export default app
`
}
