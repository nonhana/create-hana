import { COMMON_CODE_QUALITY_TOOLS_OPTIONS } from '../common'

export const VUE_CODE_QUALITY_TOOLS_OPTIONS = COMMON_CODE_QUALITY_TOOLS_OPTIONS.filter(
  option => option.value !== 'biome' && option.value !== 'oxlint-prettier',
)
