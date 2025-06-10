import type { Option } from '@/types'

export const VUE_LANGUAGE_OPTIONS: Option[] = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
]

export const VUE_MANAGER_OPTIONS: Option[] = [
  { label: 'pnpm', value: 'pnpm' },
  { label: 'yarn', value: 'yarn' },
  { label: 'npm', value: 'npm' },
  { label: 'bun', value: 'bun' },
]

export const VUE_CODE_QUALITY_TOOLS_OPTIONS: Option[] = [
  { label: 'ESLint', value: 'eslint' },
  { label: 'ESLint and Prettier', value: 'eslint-prettier' },
  { label: 'Biome', value: 'biome' },
  { label: 'None', value: 'none' },
]
