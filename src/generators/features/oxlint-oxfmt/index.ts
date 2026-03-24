import type { Config, Generator, NodeConfig, ProjectContext, ReactConfig } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'
import { generateNodeOxlintOxfmtConfig } from './node'
import { generateReactOxlintOxfmtConfig } from './react'

export type OxlintOxfmtConfig = Extract<Config, { codeQualityTools: 'oxlint-oxfmt' }>
export type NodeOxlintOxfmtConfig = Extract<NodeConfig, { codeQualityTools: 'oxlint-oxfmt' }>
export type ReactOxlintOxfmtConfig = Extract<ReactConfig, { codeQualityTools: 'oxlint-oxfmt' }>

export const oxlintOxfmtGenerator: Generator<OxlintOxfmtConfig> = {
  generate(context) {
    const { config, packageJson } = context

    addDependencies(packageJson, {
      oxlint: '^1.56.0',
      oxfmt: '^0.41.0',
      ...(config.enableTypeAware && { 'oxlint-tsgolint': '^0.17.2' }),
    }, 'devDependencies')

    addScripts(packageJson, {
      'lint': 'oxlint',
      'lint:fix': 'oxlint --fix',
      'fmt': 'oxfmt',
      'fmt:check': 'oxfmt --check',
    })

    if (isNode(context)) {
      generateNodeOxlintOxfmtConfig(context)
    }
    else if (isReact(context)) {
      generateReactOxlintOxfmtConfig(context)
    }

    if (config.codeQualityConfig) {
      context.files['.vscode/settings.json'] = generateOxlintOxfmtVscConfig()
    }
  },
}

function isNode(context: ProjectContext<OxlintOxfmtConfig>): context is ProjectContext<NodeOxlintOxfmtConfig> {
  return context.config.projectType === 'node'
}

function isReact(context: ProjectContext<OxlintOxfmtConfig>): context is ProjectContext<ReactOxlintOxfmtConfig> {
  return context.config.projectType === 'react'
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
