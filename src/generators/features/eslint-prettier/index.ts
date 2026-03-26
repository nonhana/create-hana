import type { Generator } from '@/types'
import { generateNodeESLintPrettierConfig } from './node'
import { generateReactESLintPrettierConfig } from './react'
import { generateVueESLintPrettierConfig } from './vue'

export const eslintPrettierGenerator: Generator = {
  generate(context) {
    const { config } = context

    if (config.projectType === 'node') {
      generateNodeESLintPrettierConfig(context)
    }
    else if (config.projectType === 'react') {
      generateReactESLintPrettierConfig(context)
    }
    else if (config.projectType === 'vue') {
      generateVueESLintPrettierConfig(context)
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
    '[vue]': {
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
    },
    'eslint.validate': [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'vue',
    ],
  }

  return JSON.stringify(config, null, 2)
}
