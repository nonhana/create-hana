import type { ProjectQuestionsConfig } from '@/types'
import { toMutableOptions } from '@/utils/fit-options'
import { COMMON_CODE_QUALITY_TOOLS_OPTIONS, COMMON_CSS_FRAMEWORKS_OPTIONS, COMMON_CSS_PREPROCESSORS_OPTIONS, COMMON_HTTP_OPTIONS, COMMON_LANGUAGE_OPTIONS, COMMON_MANAGER_OPTIONS, COMMON_PATH_ALIASING_OPTIONS } from '../options/common'
import { VUE_BUILD_TOOLS_OPTIONS, VUE_CODE_QUALITY_TOOLS_OPTIONS } from '../options/vue'

export const vueQuestions: ProjectQuestionsConfig = {
  projectType: 'vue',
  questions: [
    {
      id: 'language',
      type: 'select',
      message: 'Which language would you like to use?',
      field: 'language',
      options: toMutableOptions(COMMON_LANGUAGE_OPTIONS),
      initialValue: 'typescript',
    },
    {
      id: 'pkgManager',
      type: 'select',
      message: 'Which package manager would you like to use?',
      field: 'pkgManager',
      options: toMutableOptions(COMMON_MANAGER_OPTIONS),
      initialValue: 'pnpm',
    },
    {
      id: 'codeQuality',
      type: 'select',
      message: 'Which code quality tools would you like to use?',
      field: 'codeQualityTools',
      options: toMutableOptions(VUE_CODE_QUALITY_TOOLS_OPTIONS),
      initialValue: 'eslint',
    },
    {
      id: 'codeQualityConfig',
      type: 'confirm',
      message: 'Would you like to configure code quality tools for VSCode?',
      field: 'codeQualityConfig',
      initialValue: true,
    },
    {
      id: 'buildTool',
      type: 'select',
      message: 'Which build tool would you like to use?',
      field: 'buildTool',
      options: toMutableOptions(VUE_BUILD_TOOLS_OPTIONS),
      initialValue: 'vite',
    },
    {
      id: 'cssFramework',
      type: 'select',
      message: 'Which CSS framework would you like to use?',
      field: 'cssFramework',
      options: toMutableOptions(COMMON_CSS_FRAMEWORKS_OPTIONS),
      initialValue: 'tailwindcss',
    },
    {
      id: 'cssPreprocessor',
      type: 'select',
      message: 'Which CSS preprocessor would you like to use?',
      field: 'cssPreprocessor',
      options: toMutableOptions(COMMON_CSS_PREPROCESSORS_OPTIONS),
      initialValue: 'none',
    },
    {
      id: 'routingLibrary',
      type: 'confirm',
      message: 'Would you like to use Vue Router?',
      field: 'useRouter',
      initialValue: true,
    },
    {
      id: 'stateManagement',
      type: 'confirm',
      message: 'Would you like to use Pinia for state management?',
      field: 'usePinia',
      initialValue: true,
    },
    {
      id: 'httpLibrary',
      type: 'select',
      message: 'Which HTTP library would you like to use?',
      field: 'httpLibrary',
      options: toMutableOptions(COMMON_HTTP_OPTIONS),
      initialValue: 'axios',
    },
    {
      id: 'modulePathAliasing',
      type: 'select',
      message: 'Which module path aliasing would you like to use?',
      field: 'modulePathAliasing',
      options: toMutableOptions(COMMON_PATH_ALIASING_OPTIONS),
      initialValue: '@',
    },
  ],
}
