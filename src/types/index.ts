import type { PROJECT_TYPES } from '@/constants/project-types'

export interface Option {
  label: string
  value: string
}

export type Config = {
  targetDir?: string
  projectType?: PROJECT_TYPES
  git?: boolean
  installDeps?: boolean
} & NodeProjectConfig

export interface NodeProjectConfig {
  language?: 'javascript' | 'typescript'
  pkgManager?: 'pnpm' | 'yarn' | 'npm' | 'bun'
  webserverPkgs?: 'express' | 'fastify' | 'none'
  tsRuntimePkgs?: 'tsx' | 'esno' | 'ts-node' | 'none'
  preinstallPkgs?: string[]
  codeQualityTools?: 'eslint' | 'eslint-prettier' | 'biome' | 'none'
  bundler?: 'tsup' | 'tsdown' | 'none'
}

/**
 * Project generation context shared between generators
 */
export interface ProjectContext {
  /** Current project configuration */
  config: Config
  /** Project root directory path */
  projectDir: string
  /** Working directory path */
  cwd: string
  /** Package.json object that gets modified by generators */
  packageJson: PackageJsonConfig
  /** Files to be written to disk */
  files: Record<string, string>
  /** File extension for source files (.ts or .js) */
  fileExtension: string
}

/**
 * Package.json configuration structure
 */
export interface PackageJsonConfig {
  name: string
  version: string
  description?: string
  main?: string
  module?: string
  types?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  files?: string[]
  keywords?: string[]
  author?: string
  license?: string
  engines?: Record<string, string>
  exports?: Record<string, any>
  [key: string]: any
}

/**
 * Generator interface - all generators must implement this
 */
export interface Generator {
  /**
   * Generate files and modify context based on configuration
   */
  generate: (context: ProjectContext) => Promise<void> | void
}

/**
 * File to be generated
 */
export interface GeneratedFile {
  /** File path relative to project root */
  path: string
  /** File content */
  content: string
}

// Re-export question types
export * from './questions'
