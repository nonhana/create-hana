export const COMMON_LANGUAGE_OPTIONS = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
] as const

export const COMMON_MANAGER_OPTIONS = [
  { label: 'pnpm', value: 'pnpm' },
  { label: 'yarn', value: 'yarn' },
  { label: 'npm', value: 'npm' },
  { label: 'bun', value: 'bun' },
] as const

export const COMMON_CODE_QUALITY_TOOLS_OPTIONS = [
  { label: 'ESLint', value: 'eslint' },
  { label: 'ESLint and Prettier', value: 'eslint-prettier' },
  { label: 'Biome', value: 'biome' },
  { label: 'None', value: 'none' },
] as const

export const COMMON_CSS_FRAMEWORKS_OPTIONS = [
  { label: 'Tailwind CSS', value: 'tailwindcss' },
  { label: 'UnoCSS', value: 'unocss' },
  { label: 'None', value: 'none' },
] as const

export const COMMON_CSS_PREPROCESSORS_OPTIONS = [
  { label: 'None -> CSS', value: 'none' },
  { label: 'LESS', value: 'less' },
  { label: 'SCSS', value: 'scss' },
] as const

export const COMMON_HTTP_OPTIONS = [
  { label: 'Axios', value: 'axios' },
  { label: 'Ky', value: 'ky' },
  { label: 'None -> Native Fetch', value: 'none' },
] as const

export const COMMON_PATH_ALIASING_OPTIONS = [
  { label: '@/xxx', value: '@' },
  { label: '~/xxx', value: '~' },
  { label: 'None', value: 'none' },
] as const
