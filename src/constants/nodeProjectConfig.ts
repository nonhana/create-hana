import type { Option } from '@/types'

export const NODE_LANGUAGE_OPTIONS: Option[] = [
  { label: 'TypeScript（推荐）', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
]

export const NODE_MANAGER_OPTIONS: Option[] = [
  { label: 'pnpm（推荐）', value: 'pnpm' },
  { label: 'yarn', value: 'yarn' },
  { label: 'npm', value: 'npm' },
  { label: 'bun', value: 'bun' },
]

export const NODE_WEBSERVER_OPTIONS: Option[] = [
  { label: '不，这是一个通用库', value: 'none' },
  { label: '是的，使用 Fastify', value: 'fastify' },
  { label: '是的，使用 Express', value: 'express' },
]

export const NODE_TS_RUNTIME_OPTIONS: Option[] = [
  { label: 'tsx', value: 'tsx' },
  { label: 'esno', value: 'esno' },
  { label: 'ts-node', value: 'ts-node' },
  { label: '无', value: 'none' },
]

export const NODE_CODE_QUALITY_TOOLS_OPTIONS: Option[] = [
  { label: 'ESLint', value: 'eslint' },
  { label: 'ESLint 和 Prettier', value: 'eslint-prettier' },
  { label: 'Biome', value: 'biome' },
  { label: '无', value: 'none' },
]

export const NODE_BUNDLERS_OPTIONS: Option[] = [
  { label: 'tsup', value: 'tsup' },
  { label: 'tsdown', value: 'tsdown' },
  { label: '无', value: 'none' },
]
