import type {
  DependencyPresetMap,
  ManagedDependencyRegistry,
  ResolvedManagedDependencyEntry,
} from './types'
import { ErrorFactory } from '@/error/factory'

const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?(?:\+[a-z0-9.-]+)?$/i

export function validateDependencyRegistry(registry: ManagedDependencyRegistry) {
  for (const [key, dependency] of Object.entries(registry)) {
    if (!PACKAGE_NAME_PATTERN.test(dependency.packageName)) {
      throw ErrorFactory.validation(`Managed dependency "${key}" has an invalid package name: ${dependency.packageName}`)
    }

    if (!VERSION_PATTERN.test(dependency.version)) {
      throw ErrorFactory.validation(`Managed dependency "${key}" has an invalid version: ${dependency.version}`)
    }
  }

  return registry
}

export function validateDependencyPresets(
  presets: DependencyPresetMap,
  registry: ManagedDependencyRegistry,
) {
  for (const [presetKey, dependencyKeys] of Object.entries(presets)) {
    if (dependencyKeys.length === 0) {
      throw ErrorFactory.validation(`Dependency preset "${presetKey}" cannot be empty`)
    }

    assertUniqueDependencyKeys(dependencyKeys, `Dependency preset "${presetKey}"`)
    assertDependencyKeysExist(dependencyKeys, registry, `Dependency preset "${presetKey}"`)
  }

  return presets
}

export function assertDependencyKeysExist(
  dependencyKeys: readonly string[],
  registry: ManagedDependencyRegistry,
  source: string,
) {
  for (const dependencyKey of dependencyKeys) {
    if (!(dependencyKey in registry)) {
      throw ErrorFactory.validation(`${source} references an unknown dependency key: ${dependencyKey}`)
    }
  }
}

export function assertUniqueDependencyKeys(dependencyKeys: readonly string[], source: string) {
  const seen = new Set<string>()

  for (const dependencyKey of dependencyKeys) {
    if (seen.has(dependencyKey)) {
      throw ErrorFactory.validation(`${source} contains a duplicate dependency key: ${dependencyKey}`)
    }

    seen.add(dependencyKey)
  }
}

export function validateResolvedDependencies(entries: ResolvedManagedDependencyEntry[]) {
  const scopeByPackageName = new Map<string, string>()

  for (const { key, dependency } of entries) {
    const existingScope = scopeByPackageName.get(dependency.packageName)

    if (existingScope && existingScope !== dependency.scope) {
      throw ErrorFactory.validation(
        `Managed dependency keys "${key}" and "${dependency.packageName}" resolve to conflicting scopes for package "${dependency.packageName}"`,
      )
    }

    scopeByPackageName.set(dependency.packageName, dependency.scope)
  }
}
