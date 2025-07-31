import type { NodeProjectConfig, ReactProjectConfig, VueProjectConfig } from './project-configs'
import type { ReactMainEditorType, ViteConfigEditorType, VueMainEditorType } from '@/editor'
import type {
  COMMON_CODE_QUALITY_TOOLS_OPTIONS,
  COMMON_LANGUAGE_OPTIONS,
  COMMON_MANAGER_OPTIONS,
} from '@/questions/options/common'

export type Config = {
  targetDir?: string
  removeExistFolder?: boolean
  git?: boolean
  installDeps?: boolean
  language?: typeof COMMON_LANGUAGE_OPTIONS[number]['value']
  pkgManager?: typeof COMMON_MANAGER_OPTIONS[number]['value']
  codeQualityTools?: typeof COMMON_CODE_QUALITY_TOOLS_OPTIONS[number]['value']
  codeQualityConfig?: boolean
} & (
  | ({ projectType?: undefined }) // may not be set yet
  | ({ projectType: 'node' } & NodeProjectConfig)
  | ({ projectType: 'react' } & ReactProjectConfig)
  | ({ projectType: 'vue' } & VueProjectConfig)
)

// specific project config
export type NodeConfig = Config & { projectType: 'node' }
export type ReactConfig = Config & { projectType: 'react' }
export type VueConfig = Config & { projectType: 'vue' }

export interface ProjectContext {
  config: Config
  projectDir: string
  cwd: string
  packageJson: PackageJsonConfig
  files: Record<string, string>
  /** .js or .ts */
  fileExtension: '.js' | '.ts'
  viteConfigEditor?: ViteConfigEditorType
  mainEditor?: ReactMainEditorType | VueMainEditorType
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
