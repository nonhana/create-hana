export type DependencyScope = 'dependencies' | 'devDependencies' | 'peerDependencies'
export type VersionPrefix = '^' | '~' | ''
export type UpdateLevel = 'patch' | 'minor' | 'major'
export type DependencyRisk = 'low' | 'medium' | 'high'
export type TemplateCoupling = 'none' | 'config' | 'runtime'
export type ReleaseImpact = 'patch' | 'minor'

export interface ManagedDependency {
  packageName: string
  version: string
  prefix: VersionPrefix
  scope: DependencyScope
  risk: DependencyRisk
  templateCoupling: TemplateCoupling
  autoUpdate: Record<UpdateLevel, boolean>
  releaseImpact: ReleaseImpact
  notes?: string
}

export type ManagedDependencyRegistry = Record<string, ManagedDependency>
export type DependencyPresetMap = Record<string, readonly string[]>

export interface ResolvedManagedDependencies {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface ResolvedManagedDependencyEntry {
  key: string
  dependency: ManagedDependency
}
