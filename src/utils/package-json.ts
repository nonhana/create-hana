import type { PackageJsonConfig } from '@/types'

/**
 * Deep merge multiple package.json configurations
 */
export function mergePackageJson(...configs: Partial<PackageJsonConfig>[]): PackageJsonConfig {
  const result: PackageJsonConfig = {
    name: '',
    version: '1.0.0',
  }

  for (const config of configs) {
    // Merge basic properties, but exclude dependency objects
    const { dependencies, devDependencies, peerDependencies, scripts, files, keywords, ...basicProps } = config
    Object.assign(result, basicProps)

    // Special handling for dependencies - merge instead of replace
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

/**
 * Add dependencies to package.json config
 */
export function addDependencies(
  packageJson: PackageJsonConfig,
  dependencies: Record<string, string>,
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' = 'dependencies',
): void {
  if (!packageJson[type]) {
    packageJson[type] = {}
  }
  Object.assign(packageJson[type]!, dependencies)
}

/**
 * Add scripts to package.json config
 */
export function addScripts(packageJson: PackageJsonConfig, scripts: Record<string, string>): void {
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }
  Object.assign(packageJson.scripts, scripts)
}

/**
 * Sort package.json keys in conventional order
 */
export function sortPackageJson(packageJson: PackageJsonConfig): PackageJsonConfig {
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

  // Add keys in order
  for (const key of keyOrder) {
    if (key in packageJson) {
      (sorted as any)[key] = packageJson[key]
    }
  }

  // Add any remaining keys
  for (const key in packageJson) {
    if (!keyOrder.includes(key as any)) {
      (sorted as any)[key] = packageJson[key as keyof PackageJsonConfig]
    }
  }

  return sorted as PackageJsonConfig
}
