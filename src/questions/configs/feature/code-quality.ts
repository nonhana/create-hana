import type { QuestionConfig } from '@/types'
import { COMMON_CODE_QUALITY_TOOLS_OPTIONS } from '@/questions/options/common'
import { VUE_CODE_QUALITY_TOOLS_OPTIONS } from '@/questions/options/features/vue'
import { toMutableOptions } from '@/utils/fit-options'

export const codeQualityQuestions: QuestionConfig[] = [
  {
    id: 'codeQuality',
    type: 'select',
    message: 'Which code quality tools would you like to use?',
    field: 'codeQualityTools',
    options: (config) => {
      // currently, support for .vue is limited for biome and oxc.
      return config.projectType !== 'vue'
        ? toMutableOptions(COMMON_CODE_QUALITY_TOOLS_OPTIONS)
        : toMutableOptions(VUE_CODE_QUALITY_TOOLS_OPTIONS)
    },
    initialValue: 'none',
  },
  {
    id: 'oxlintTypeAware',
    type: 'confirm',
    message: 'Enable type-aware linting?',
    field: 'enableTypeAware',
    initialValue: true,
    when: {
      type: 'cascade',
      situation: [{
        field: 'codeQualityTools',
        value: 'oxlint-oxfmt',
        operator: 'eq',
      }, {
        field: 'language',
        value: 'typescript',
        operator: 'eq',
      }],
    },
  },
  {
    id: 'codeQualityConfig',
    type: 'confirm',
    message: 'Would you like to configure code quality tools for VSCode?',
    field: 'codeQualityConfig',
    initialValue: true,
    when: {
      type: 'cascade',
      situation: [{
        field: 'codeQualityTools',
        value: 'none',
        operator: 'neq',
      }],
    },
  },
]
