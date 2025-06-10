import type { QuestionsSetConfig } from '@/types'
import {
  NODE_BUNDLERS_OPTIONS,
  NODE_CODE_QUALITY_TOOLS_OPTIONS,
  NODE_LANGUAGE_OPTIONS,
  NODE_MANAGER_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from './node-project-config'

export const QUESTIONS_CONFIG: QuestionsSetConfig = {
  common: [
    {
      id: 'projectName',
      type: 'text',
      message: 'Project name:',
      field: 'targetDir',
      defaultValue: 'hana-project',
      placeholder: 'hana-project',
    },
    {
      id: 'projectType',
      type: 'select',
      message: 'What project do you want to create?',
      field: 'projectType',
      options: [
        { label: 'Common Node.js', value: 'node' },
      ],
    },
    {
      id: 'removeExistFolder',
      type: 'select',
      message: 'Do you want to remove the existing folder?',
      field: 'removeExistFolder',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
      initialValue: false,
      when: {
        type: 'static',
        situation: async (config) => {
          if (!config || !config.targetDir)
            return false
          const { existsSync } = await import('node:fs')
          return existsSync(config.targetDir)
        },
      },
    },
  ],

  projects: [
    {
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
    },
  ],

  final: [
    {
      id: 'git',
      type: 'confirm',
      message: 'Do you want to initialize a git repository?',
      field: 'git',
      initialValue: false,
    },
    {
      id: 'installDeps',
      type: 'confirm',
      message: 'Do you want to install dependencies immediately?',
      field: 'installDeps',
      initialValue: false,
    },
  ],
}
