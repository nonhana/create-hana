import type { Option } from '@/types'

export const NODE_LANGUAGE_OPTIONS: Option[] = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
]

export const NODE_MANAGER_OPTIONS: Option[] = [
  { label: 'pnpm', value: 'pnpm' },
  { label: 'yarn', value: 'yarn' },
  { label: 'npm', value: 'npm' },
  { label: 'bun', value: 'bun' },
]

export const NODE_WEBSERVER_OPTIONS: Option[] = [
  { label: 'No, this is a common library', value: 'none' },
  { label: 'Yes, use Fastify', value: 'fastify' },
  { label: 'Yes, use Express', value: 'express' },
]

export const NODE_TS_RUNTIME_OPTIONS: Option[] = [
  { label: 'tsx', value: 'tsx' },
  { label: 'esno', value: 'esno' },
  { label: 'ts-node', value: 'ts-node' },
  { label: 'None', value: 'none' },
]

export const NODE_CODE_QUALITY_TOOLS_OPTIONS: Option[] = [
  { label: 'ESLint', value: 'eslint' },
  { label: 'ESLint and Prettier', value: 'eslint-prettier' },
  { label: 'Biome', value: 'biome' },
  { label: 'None', value: 'none' },
]

export const NODE_BUNDLERS_OPTIONS: Option[] = [
  { label: 'tsup', value: 'tsup' },
  { label: 'tsdown', value: 'tsdown' },
  { label: 'None', value: 'none' },
]
