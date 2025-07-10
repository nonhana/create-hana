import type { Generator } from '@/types'
import { generateNodeESLintConfig } from './node'
import { generateReactESLintConfig } from './react'

export const eslintGenerator: Generator = {
  generate(context) {
    const { config } = context

    if (config.projectType === 'node') {
      generateNodeESLintConfig(context)
    }
    else if (config.projectType === 'react') {
      generateReactESLintConfig(context)
    }

    if (config.codeQualityConfig) {
      context.files['.vscode/settings.json'] = generateESlintVscodeConfig()
    }
  },
}

function generateESlintVscodeConfig() {
  const config = {
    'prettier.enable': false,
    'biome.enable': false,
    'editor.formatOnSave': false,
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
      'source.organizeImports': 'never',
    },
    '[typescript]': {
      'editor.defaultFormatter': null,
    },
    '[javascript]': {
      'editor.defaultFormatter': null,
    },
    'eslint.rules.customizations': [
      { rule: '@stylistic/*', severity: 'off' },
      { rule: '*-indent', severity: 'off' },
      { rule: '*-spacing', severity: 'off' },
      { rule: '*-spaces', severity: 'off' },
      { rule: '*-order', severity: 'off' },
      { rule: '*-dangle', severity: 'off' },
      { rule: '*-newline', severity: 'off' },
      { rule: '*-multiline', severity: 'off' },
      { rule: '*quotes', severity: 'off' },
      { rule: '*semi', severity: 'off' },
    ],
    'eslint.validate': [
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'json',
      'jsonc',
      'yaml',
      'markdown',
    ],
  }

  return JSON.stringify(config, null, 2)
}
