import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'
import { generateNodeBiomeConfig } from './node'
import { generateReactBiomeConfig } from './react'

export const biomeGenerator: Generator = {
  generate(context) {
    const { config } = context

    addDependencies(context.packageJson, {
      '@biomejs/biome': '^1.9.4',
    }, 'devDependencies')

    addScripts(context.packageJson, {
      'lint': 'biome lint src/',
      'lint:fix': 'biome lint --apply src/',
      'format': 'biome format --write src/',
      'format:check': 'biome format src/',
      'check': 'biome check src/',
      'check:fix': 'biome check --apply src/',
    })

    if (config.projectType === 'node') {
      generateNodeBiomeConfig(context)
    }
    else if (config.projectType === 'react') {
      generateReactBiomeConfig(context)
    }

    if (context.config.codeQualityConfig) {
      const biomeVscodeConfig = generateBiomeVscodeConfig()
      context.files['.vscode/settings.json'] = biomeVscodeConfig
    }
  },
}

function generateBiomeVscodeConfig() {
  const config = {
    'prettier.enable': false,
    'editor.codeActionsOnSave': {},
    'eslint.enable': false,
    'editor.defaultFormatter': 'biomejs.biome',
    'editor.formatOnSave': true,
    'editor.formatOnPaste': true,
    'editor.formatOnType': false,
    '[javascript]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[javascriptreact]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[typescriptreact]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[json]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
    '[jsonc]': {
      'editor.defaultFormatter': 'biomejs.biome',
    },
  }

  return JSON.stringify(config, null, 2)
}
