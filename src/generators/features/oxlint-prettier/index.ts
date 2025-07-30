import type { Generator } from '@/types'
import { generateNodeOxlintPrettierConfig } from './node'
import { generateReactOxlintPrettierConfig } from './react'
import { generateVueOxlintPrettierConfig } from './vue'

export const oxlintPrettierGenerator: Generator = {
  generate(context) {
    const { config } = context

    if (config.projectType === 'node') {
      generateNodeOxlintPrettierConfig(context)
    }
    else if (config.projectType === 'react') {
      generateReactOxlintPrettierConfig(context)
    }
    else if (config.projectType === 'vue') {
      generateVueOxlintPrettierConfig(context)
    }

    if (config.codeQualityConfig) {
      context.files['.vscode/settings.json'] = generateOxlintPrettierVscodeConfig()
    }
  },
}

function generateOxlintPrettierVscodeConfig() {
  const config = {
    'oxc.enable': true,
    'oxc.requireConfig': true,
    'oxc.lint.run': 'onType',
    'biome.enabled': false,
    'eslint.enable': false,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.oxlint': 'explicit',
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
  }

  return JSON.stringify(config, null, 2)
}
