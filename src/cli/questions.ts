import type { Config, NodeProjectConfig } from '@/types'
import * as prompts from '@clack/prompts'
import { ErrorMessages } from '@/constants/errors'
import {
  NODE_BUNDLERS_OPTIONS,
  NODE_CODE_QUALITY_TOOLS_OPTIONS,
  NODE_LANGUAGE_OPTIONS,
  NODE_MANAGER_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '@/constants/node-project-config'
import { ErrorFactory } from '@/utils/error'

const cancel = () => prompts.cancel(ErrorMessages.userInput.operationCancelled())

export async function furtherQuestions(config: Config) {
  if (!config.projectType) {
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  }

  const furtherConfig: any = {}

  switch (config.projectType) {
    case 'node':
      await nodeQuestions(furtherConfig)
  }

  Object.assign(config, furtherConfig)
}

async function nodeQuestions(nodeConfig: NodeProjectConfig) {
  if (!nodeConfig.language) {
    const targetLanguage = await prompts.select({
      message: '您想使用什么语言？',
      options: NODE_LANGUAGE_OPTIONS,
      initialValue: 'typescript',
    })
    if (prompts.isCancel(targetLanguage))
      return cancel()
    nodeConfig.language = targetLanguage as 'typescript' | 'javascript'
  }

  if (!nodeConfig.pkgManager) {
    const targetManager = await prompts.select({
      message: '您想使用什么包管理器？',
      options: NODE_MANAGER_OPTIONS,
      initialValue: 'pnpm',
    })
    if (prompts.isCancel(targetManager))
      return cancel()
    nodeConfig.pkgManager = targetManager as 'pnpm' | 'yarn' | 'npm' | 'bun'
  }

  if (!nodeConfig.webserverPkgs) {
    const targetWebserver = await prompts.select({
      message: '您想要安装一些简单的 Web 框架吗？',
      options: NODE_WEBSERVER_OPTIONS,
      initialValue: 'fastify',
    })
    if (prompts.isCancel(targetWebserver))
      return cancel()
    nodeConfig.webserverPkgs = targetWebserver as 'express' | 'fastify' | 'none'
  }

  // TS 项目特殊问题
  if (nodeConfig.language === 'typescript' && !nodeConfig.tsRuntimePkgs) {
    const targetTsRuntime = await prompts.select({
      message: '您想使用什么 TypeScript 运行时？',
      options: NODE_TS_RUNTIME_OPTIONS,
      initialValue: 'tsx',
    })
    if (prompts.isCancel(targetTsRuntime))
      return cancel()
    nodeConfig.tsRuntimePkgs = targetTsRuntime as 'tsx' | 'esno' | 'ts-node' | 'none'
  }

  if (!nodeConfig.codeQualityTools) {
    const targetCodeQualityTools = await prompts.select({
      message: '您想使用什么代码质量工具？',
      options: NODE_CODE_QUALITY_TOOLS_OPTIONS,
      initialValue: 'eslint-prettier',
    })
    if (prompts.isCancel(targetCodeQualityTools))
      return cancel()
    nodeConfig.codeQualityTools = targetCodeQualityTools as 'eslint' | 'eslint-prettier' | 'biome' | 'none'
  }

  // TS 项目特殊问题
  if (nodeConfig.language === 'typescript' && !nodeConfig.bundler) {
    const targetBundler = await prompts.select({
      message: '您想使用什么打包工具？',
      options: NODE_BUNDLERS_OPTIONS,
      initialValue: 'tsup',
    })
    if (prompts.isCancel(targetBundler))
      return cancel()
    nodeConfig.bundler = targetBundler as 'tsup' | 'tsdown' | 'none'
  }
}
