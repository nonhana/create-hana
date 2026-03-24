import type { ProjectQuestionsConfig } from '@/types'
import { toMutableOptions } from '@/utils/fit-options'
import {
  COMMON_LANGUAGE_OPTIONS,
  COMMON_MANAGER_OPTIONS,
} from '../options/common'
import {
  NODE_BUNDLERS_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '../options/features/node'
import { codeQualityQuestions } from './feature/code-quality'

export const nodeQuestions: ProjectQuestionsConfig = {
  projectType: 'node',
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
      id: 'webserver',
      type: 'select',
      message: 'Would you like to install a simple web framework?',
      field: 'webserverPkgs',
      options: toMutableOptions(NODE_WEBSERVER_OPTIONS),
      initialValue: 'none',
    },
    {
      id: 'tsRuntime',
      type: 'select',
      message: 'Which TypeScript runtime would you like to use?',
      field: 'tsRuntimePkgs',
      options: toMutableOptions(NODE_TS_RUNTIME_OPTIONS),
      initialValue: 'none',
      when: {
        type: 'cascade',
        situation: [{
          field: 'language',
          value: 'typescript',
          operator: 'eq',
        }],
      },
    },
    {
      id: 'bundler',
      type: 'select',
      message: 'Which bundler would you like to use?',
      field: 'bundler',
      options: toMutableOptions(NODE_BUNDLERS_OPTIONS),
      initialValue: 'none',
      when: {
        type: 'cascade',
        situation: [{
          field: 'language',
          value: 'typescript',
          operator: 'eq',
        }],
      },
    },
  ],
}
