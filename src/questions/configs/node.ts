import type { ProjectQuestionsConfig } from '@/types'
import {
  NODE_BUNDLERS_OPTIONS,
  NODE_CODE_QUALITY_TOOLS_OPTIONS,
  NODE_LANGUAGE_OPTIONS,
  NODE_MANAGER_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '../options/node'

export const nodeQuestions: ProjectQuestionsConfig = {
  projectType: 'node',
  questions: [
    {
      id: 'language',
      type: 'select',
      message: 'Which language would you like to use?',
      field: 'language',
      options: NODE_LANGUAGE_OPTIONS,
      initialValue: 'typescript',
    },
    {
      id: 'pkgManager',
      type: 'select',
      message: 'Which package manager would you like to use?',
      field: 'pkgManager',
      options: NODE_MANAGER_OPTIONS,
      initialValue: 'pnpm',
    },
    {
      id: 'webserver',
      type: 'select',
      message: 'Would you like to install a simple web framework?',
      field: 'webserverPkgs',
      options: NODE_WEBSERVER_OPTIONS,
      initialValue: 'none',
    },
    {
      id: 'tsRuntime',
      type: 'select',
      message: 'Which TypeScript runtime would you like to use?',
      field: 'tsRuntimePkgs',
      options: NODE_TS_RUNTIME_OPTIONS,
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
      id: 'codeQuality',
      type: 'select',
      message: 'Which code quality tools would you like to use?',
      field: 'codeQualityTools',
      options: NODE_CODE_QUALITY_TOOLS_OPTIONS,
      initialValue: 'none',
    },
    {
      id: 'codeQualityConfig',
      type: 'confirm',
      message: 'Would you like to configure code quality tools for VSCode?',
      field: 'codeQualityConfig',
      initialValue: false,
      when: {
        type: 'cascade',
        situation: [{
          field: 'codeQualityTools',
          value: 'none',
          operator: 'neq',
        }],
      },
    },
    {
      id: 'bundler',
      type: 'select',
      message: 'Which bundler would you like to use?',
      field: 'bundler',
      options: NODE_BUNDLERS_OPTIONS,
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
