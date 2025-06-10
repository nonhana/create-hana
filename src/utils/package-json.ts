import type { PackageJsonConfig } from '@/types'

export function mergePackageJson(...configs: Partial<PackageJsonConfig>[]) {
  const result: PackageJsonConfig = {
    name: '',
    version: '1.0.0',
  }

  for (const config of configs) {
    const { dependencies, devDependencies, peerDependencies, scripts, files, keywords, ...basicProps } = config
    Object.assign(result, basicProps)

    if (dependencies) {
      result.dependencies = { ...result.dependencies, ...dependencies }
    }
    if (devDependencies) {
      result.devDependencies = { ...result.devDependencies, ...devDependencies }
    }
    if (peerDependencies) {
      result.peerDependencies = { ...result.peerDependencies, ...peerDependencies }
    }
    if (scripts) {
      result.scripts = { ...result.scripts, ...scripts }
    }
    if (files) {
      result.files = [...(result.files || []), ...files]
    }
    if (keywords) {
      result.keywords = [...(result.keywords || []), ...keywords]
    }
  }

  return result
}

export function addDependencies(
  packageJson: PackageJsonConfig,
  dependencies: Record<string, string>,
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies',
) {
  if (!packageJson[type]) {
    packageJson[type] = {}
  }
  Object.assign(packageJson[type]!, dependencies)
}

export function addScripts(packageJson: PackageJsonConfig, scripts: Record<string, string>) {
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }
  Object.assign(packageJson.scripts, scripts)
}

export function sortPackageJson(packageJson: PackageJsonConfig) {
  const keyOrder = [
    'name',
    'version',
    'description',
    'keywords',
    'author',
    'license',
    'main',
    'module',
    'types',
    'exports',
    'files',
    'scripts',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'engines',
  ] as const

  const sorted: Partial<PackageJsonConfig> = {}

  for (const key of keyOrder) {
    if (key in packageJson) {
      (sorted as any)[key] = packageJson[key]
    }
  }

  for (const key in packageJson) {
    if (!keyOrder.includes(key as any)) {
      (sorted as any)[key] = packageJson[key as keyof PackageJsonConfig]
    }
  }

  return sorted as PackageJsonConfig
}
