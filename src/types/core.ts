import type { NodeProjectConfig, ReactProjectConfig } from './project-configs'
import type { MainEditor, ViteConfigEditor } from '@/editor'

export type Config = {
  targetDir?: string
  removeExistFolder?: boolean
  git?: boolean
  installDeps?: boolean
} & (
  | ({ projectType?: undefined })
  | ({ projectType: 'node' } & NodeProjectConfig)
  | ({ projectType: 'react' } & ReactProjectConfig)
)

export interface ProjectContext {
  config: Config
  projectDir: string
  cwd: string
  packageJson: PackageJsonConfig
  files: Record<string, string>
  /** .js or .ts */
  fileExtension: '.js' | '.ts'
  viteConfigEditor?: InstanceType<typeof ViteConfigEditor>
  mainEditor?: InstanceType<typeof MainEditor>
}

export interface PackageJsonConfig {
  name: string
  version: string
  description?: string
  type?: 'module' | 'commonjs'
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

export interface Generator {
  generate: (context: ProjectContext) => Promise<void> | void
}

export interface PackageManager {
  name: string
  command: string
  installArgs: string[]
  lockFile: string
}
