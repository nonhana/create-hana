export const HONO_RUNTIME_OPTIONS = [
  { label: 'Node.js', value: 'node' },
  { label: 'Cloudflare Workers', value: 'cloudflare-workers' },
  { label: 'Bun', value: 'bun' },
  { label: 'Deno', value: 'deno' },
  { label: 'Vercel (Edge/Serverless)', value: 'vercel' },
  { label: 'Other (generic)', value: 'other' },
] as const

export const HONO_PURPOSE_OPTIONS = [
  { label: 'REST API', value: 'rest' },
  { label: 'Full-Stack (SSR)', value: 'ssr' },
  { label: 'RPC Service', value: 'rpc' },
] as const

export const HONO_JSX_LIBRARIES_OPTIONS = [
  { label: 'React', value: 'react' },
  { label: 'Preact', value: 'preact' },
  { label: 'SolidJS', value: 'solid' },
] as const

export const HONO_VALIDATION_LIBRARIES_OPTIONS = [
  { label: 'Zod', value: 'zod' },
  { label: 'Valibot', value: 'valibot' },
  { label: 'Yup', value: 'yup' },
  { label: 'None', value: 'none' },
] as const

export const HONO_DATABASE_OPTIONS = [
  { label: 'Prisma', value: 'prisma' },
  { label: 'Drizzle ORM', value: 'drizzle' },
  { label: 'Kysely', value: 'kysely' },
  { label: 'None (I will add it later)', value: 'none' },
] as const

export const HONO_AUTH_OPTIONS = [
  { label: 'JWT (JSON Web Token)', value: 'jwt' },
  { label: 'Lucia Auth', value: 'lucia' },
  { label: 'Auth.js', value: 'authjs' },
  { label: 'Basic Auth', value: 'basic' },
  { label: 'None', value: 'none' },
] as const

export const HONO_MIDDLEWARE_OPTIONS = [
  { label: 'CORS', value: 'cors' },
  { label: 'Secure Headers', value: 'secure-headers' },
  { label: 'Rate Limiter', value: 'rate-limiter' },
  { label: 'Logger', value: 'logger' },
] as const

export const HONO_TEST_FRAMEWORKS_OPTIONS = [
  { label: 'Vitest', value: 'vitest' },
  { label: 'Jest', value: 'jest' },
  { label: 'None', value: 'none' },
] as const
