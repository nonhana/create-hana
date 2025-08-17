import type { QuestionsSetConfig } from '@/types'
import { PROJECTS } from '@/constants/project-types'
import { toMutableOptions } from '@/utils/fit-options'
import { honoQuestions } from './hono'
import { nodeQuestions } from './node'
import { reactQuestions } from './react'
import { vueQuestions } from './vue'

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
      options: toMutableOptions(PROJECTS),
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
    nodeQuestions,
    reactQuestions,
    vueQuestions,
    honoQuestions,
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
