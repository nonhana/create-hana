import type { ProjectQuestionsConfig } from '@/types'
import { toMutableOptions } from '@/utils/fit-options'
import {
  COMMON_LANGUAGE_OPTIONS,
  COMMON_MANAGER_OPTIONS,
  COMMON_PATH_ALIASING_OPTIONS,
} from '../options/common'
import {
  FRONTEND_BUILD_TOOLS_OPTIONS,
  FRONTEND_CSS_FRAMEWORKS_OPTIONS,
  FRONTEND_CSS_PREPROCESSORS_OPTIONS,
  FRONTEND_HTTP_OPTIONS,
} from '../options/frontend'
import { codeQualityQuestions } from './feature/code-quality'

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

    // features
    ...codeQualityQuestions,

    {
      id: 'buildTool',
      type: 'select',
      message: 'Which build tool would you like to use?',
      field: 'buildTool',
      options: toMutableOptions(FRONTEND_BUILD_TOOLS_OPTIONS),
      initialValue: 'vite',
    },
    {
      id: 'cssFramework',
      type: 'select',
      message: 'Which CSS framework would you like to use?',
      field: 'cssFramework',
      options: toMutableOptions(FRONTEND_CSS_FRAMEWORKS_OPTIONS),
      initialValue: 'tailwindcss',
    },
    {
      id: 'cssPreprocessor',
      type: 'select',
      message: 'Which CSS preprocessor would you like to use?',
      field: 'cssPreprocessor',
      options: toMutableOptions(FRONTEND_CSS_PREPROCESSORS_OPTIONS),
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
      options: toMutableOptions(FRONTEND_HTTP_OPTIONS),
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
