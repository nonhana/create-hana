import { COMMON_CODE_QUALITY_TOOLS_OPTIONS } from './common'

export const VUE_BUILD_TOOLS_OPTIONS = [
  { label: 'Vite', value: 'vite' },
  // { label: 'Rspack', value: 'rspack' },
  // { label: 'Webpack', value: 'webpack' },
] as const

export const VUE_CODE_QUALITY_TOOLS_OPTIONS = COMMON_CODE_QUALITY_TOOLS_OPTIONS.filter(
  option => option.value !== 'biome',
)
