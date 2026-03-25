import type { Config, Generator } from '@/types'
import { addDependencyPreset, addScripts } from '@/utils/package-json'
import { generateNodeOxlintOxfmtConfig } from './node'
import { generateReactOxlintOxfmtConfig } from './react'

export const oxlintOxfmtGenerator: Generator<
  Extract<Config, { codeQualityTools: 'oxlint-oxfmt' }>
> = {
  generate(context) {
    const { config, packageJson } = context

    addDependencyPreset(packageJson, 'feature.code-quality.oxlint-oxfmt.base')

    if (config.enableTypeAware) {
      addDependencyPreset(packageJson, 'feature.code-quality.oxlint-oxfmt.type-aware')
    }

    addScripts(packageJson, {
      'lint': 'oxlint',
      'lint:fix': 'oxlint --fix',
      'fmt': 'oxfmt',
      'fmt:check': 'oxfmt --check',
    })

    if (config.projectType === 'node') {
      generateNodeOxlintOxfmtConfig(context as any)
    }
    else if (config.projectType === 'react') {
      generateReactOxlintOxfmtConfig(context as any)
    }

    if (config.codeQualityConfig) {
      context.files['.vscode/settings.json'] = generateOxlintOxfmtVscConfig()
    }
  },
}

function generateOxlintOxfmtVscConfig() {
  const config = {
    'prettier.enable': false,
    'eslint.enable': false,
    'oxc.enable': true,
    'oxc.fmt.configPath': '.oxfmtrc.json',
    // 'oxc.typeAware': true,
    'editor.defaultFormatter': 'oxc.oxc-vscode',
    'editor.formatOnSave': true,
    'editor.codeActionsOnSave': {
      'source.fixAll.oxc': 'always',
    },
    '[typescript]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
    '[javascript]': {
      'editor.defaultFormatter': 'oxc.oxc-vscode',
    },
  }

  return JSON.stringify(config, null, 2)
}
