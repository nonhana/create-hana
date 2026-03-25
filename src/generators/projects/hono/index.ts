import type { Generator, HonoConfig, ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset, addScripts } from '@/utils/package-json'
import { generateGitignore, generateReadmeTemplate } from '@/utils/template'

type HonoProjectContext = ProjectContext<HonoConfig>

export const honoGenerator: Generator = {
  generate(context) {
    const { config } = context
    if (!config.projectType)
      throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
    if (config.projectType !== 'hono')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const honoContext = context as HonoProjectContext
    const { packageJson } = honoContext
    const projectName = config.targetDir || 'hono-app'

    addDependencyPreset(packageJson, 'project.hono.base')

    // runtime specific deps & scripts
    configureRuntime(honoContext)

    // purpose templates
    generatePurposeTemplates(honoContext)

    // validation
    configureValidation(honoContext)

    // openapi if zod
    if (config.openapi && config.validationLibrary === 'zod') {
      addDependencyPreset(packageJson, 'feature.hono.openapi.zod')
    }

    // database
    configureDatabase(honoContext)

    // auth
    configureAuth(honoContext)

    // middlewares
    configureMiddlewares(honoContext)

    // testing
    configureTesting(honoContext)

    // root files
    honoContext.files['.gitignore'] = generateGitignore()
    honoContext.files['README.md'] = generateReadmeTemplate(
      'hono',
      projectName,
      'A Hono.js project',
    )

    // package json basic
    honoContext.packageJson.name = projectName
    honoContext.packageJson.description = 'A Hono.js project'
    honoContext.packageJson.version = '1.0.0'
    honoContext.packageJson.license = 'MIT'
    honoContext.packageJson.engines = {
      node: '>=18.12.0',
    }
  },
}

function configureRuntime(context: HonoProjectContext) {
  const { config, packageJson, fileExtension } = context

  switch (config.runtime) {
    case 'node': {
      addDependencyPreset(packageJson, 'feature.hono.runtime.node')
      addScripts(packageJson, {
        dev: `tsx src/server${fileExtension}`,
        start: `node dist/server.js`,
      })

      context.files[`src/server${fileExtension}`] = generateNodeServerFile()
      context.files[`src/app${fileExtension}`] = generateAppFile()
      break
    }
    case 'cloudflare-workers': {
      addDependencyPreset(packageJson, 'feature.hono.runtime.cloudflare-workers')
      addScripts(packageJson, {
        dev: 'wrangler dev',
        start: 'wrangler start',
      })
      context.files[`src/index${fileExtension}`] = generateCfWorkerEntry()
      context.files[`wrangler.toml`] = generateWranglerToml()
      break
    }
    case 'bun': {
      addScripts(packageJson, {
        dev: `bun run src/server${fileExtension}`,
        start: `bun run dist/server.js`,
      })
      context.files[`src/server${fileExtension}`] = generateNodeServerFile()
      context.files[`src/app${fileExtension}`] = generateAppFile()
      break
    }
    case 'deno': {
      addScripts(packageJson, {
        dev: `deno run -A src/server${fileExtension}`,
      })
      context.files[`src/server${fileExtension}`] = generateDenoServerFile()
      context.files[`src/app${fileExtension}`] = generateAppFile()
      break
    }
    case 'vercel': {
      context.files[`api/index${fileExtension}`] = generateVercelEdgeEntry()
      context.files['vercel.json'] = generateVercelJson()
      break
    }
    case 'other':
    default: {
      context.files[`src/index${fileExtension}`] = generateGenericEntryFile()
      break
    }
  }
}

function generatePurposeTemplates(context: HonoProjectContext) {
  const { config, fileExtension } = context
  if (config.purpose === 'rest') {
    context.files[`src/routes/index${fileExtension}`] = `import { Hono } from 'hono'

export const router = new Hono()

router.get('/', c => c.text('Hello from Hono!'))
router.post('/users', async c => {
  const user = await c.req.json()
  return c.json({ id: 1, ...user })
})
`
  }
  else if (config.purpose === 'rpc') {
    context.files[`src/routes/rpc${fileExtension}`] = `import { Hono } from 'hono'
export const router = new Hono()
router.get('/ping', c => c.json({ ok: true }))
`
  }
  else if (config.purpose === 'ssr') {
    context.files[`src/views/index${fileExtension}x`] = `export default function Page() { return <div>Hello Hono SSR</div> }`
  }
}

function configureValidation(context: HonoProjectContext) {
  const { config, packageJson } = context
  switch (config.validationLibrary) {
    case 'zod':
      addDependencyPreset(packageJson, 'feature.hono.validation.zod')
      break
    case 'valibot':
      addDependencyPreset(packageJson, 'feature.hono.validation.valibot')
      break
    case 'yup':
      addDependencyPreset(packageJson, 'feature.hono.validation.yup')
      break
  }
}

function configureDatabase(context: HonoProjectContext) {
  const { config } = context
  switch (config.database) {
    case 'prisma':
      addDependencyPreset(context.packageJson, 'feature.hono.database.prisma')
      context.files['prisma/schema.prisma'] = `datasource db { provider = "postgresql" url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }`
      break
    case 'drizzle':
      addDependencyPreset(context.packageJson, 'feature.hono.database.drizzle')
      context.files['drizzle.config.ts'] = `export default { schema: './src/db/schema.ts' }`
      context.files['src/db/schema.ts'] = `// define drizzle schema here`
      break
    case 'kysely':
      addDependencyPreset(context.packageJson, 'feature.hono.database.kysely')
      break
  }
}

function configureAuth(context: HonoProjectContext) {
  const { config } = context
  switch (config.auth) {
    case 'lucia':
      addDependencyPreset(context.packageJson, 'feature.hono.auth.lucia')
      break
    case 'authjs':
      addDependencyPreset(context.packageJson, 'feature.hono.auth.authjs')
      break
  }
}

function configureMiddlewares(_context: HonoProjectContext) {}

function configureTesting(context: HonoProjectContext) {
  const { config, packageJson } = context
  if (config.testFramework === 'vitest') {
    addDependencyPreset(packageJson, 'feature.hono.testing.vitest')
    addScripts(packageJson, {
      test: 'vitest run --passWithNoTests',
    })
  }
  else if (config.testFramework === 'jest') {
    addDependencyPreset(packageJson, 'feature.hono.testing.jest')
    addScripts(packageJson, {
      test: 'jest --passWithNoTests',
    })
  }
}

function generateAppFile() {
  return `import { Hono } from 'hono'

export const app = new Hono()

app.get('/', c => c.text('Hello Hono'))
`
}

function generateNodeServerFile() {
  return `import { serve } from '@hono/node-server'
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

function generateVercelJson() {
  return JSON.stringify({
    version: 2,
    functions: {
      'api/index.ts': {
        runtime: 'edge',
      },
    },
  }, null, 2)
}
