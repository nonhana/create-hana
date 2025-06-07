import type { PROJECT_TYPES } from '@/constants/projectTypes'

export interface Option {
  label: string
  value: string
}

export interface Config {
  targetDir?: string
  projectType?: PROJECT_TYPES
  git?: boolean
}

export interface NodeProjectConfig {
  language?: 'javascript' | 'typescript'
  pkgManager?: 'pnpm' | 'yarn' | 'npm' | 'bun'
  webserverPkgs?: 'express' | 'fastify' | 'none'
  tsRuntimePkgs?: 'tsx' | 'esno' | 'ts-node' | 'none'
  preinstallPkgs?: string[]
  codeQualityTools?: 'eslint' | 'eslint-prettier' | 'biome' | 'none'
  bundler?: 'tsup' | 'tsdown' | 'none'
}
