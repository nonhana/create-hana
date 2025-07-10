import type { Generator } from '@/types'
import { generateNodeESLintPrettierConfig } from './node'
import { generateReactESLintPrettierConfig } from './react'

export const eslintPrettierGenerator: Generator = {
  generate(context) {
    const { config } = context

    if (config.projectType === 'node') {
      generateNodeESLintPrettierConfig(context)
    }
    else if (config.projectType === 'react') {
      generateReactESLintPrettierConfig(context)
    }

    if (config.codeQualityConfig) {
      context.files['.vscode/settings.json'] = generateESLintPrettierVscodeConfig()
    }
  },
}

function generateESLintPrettierVscodeConfig() {
  const config = {
    'biome.enabled': false,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
      'source.organizeImports': 'never',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
    },
    '[javascript]': {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
    },
    'eslint.validate': [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
    ],
  }

  return JSON.stringify(config, null, 2)
}
