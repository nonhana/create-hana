import type {
  ManagedDependencyRegistry,
  ResolvedManagedDependencies,
  ResolvedManagedDependencyEntry,
} from './types'
import { ErrorFactory } from '@/error/factory'
import { dependencyPresets } from './presets'
import { dependencyRegistry } from './registry'
import { assertDependencyKeysExist, validateResolvedDependencies } from './validator'

function formatDependencyRange(prefix: string, version: string) {
  return `${prefix}${version}`
}

function compactResolvedDependencies(entries: ResolvedManagedDependencies): ResolvedManagedDependencies {
  const result: ResolvedManagedDependencies = {}

  if (entries.dependencies && Object.keys(entries.dependencies).length > 0) {
    result.dependencies = entries.dependencies
  }

  if (entries.devDependencies && Object.keys(entries.devDependencies).length > 0) {
    result.devDependencies = entries.devDependencies
  }

  if (entries.peerDependencies && Object.keys(entries.peerDependencies).length > 0) {
    result.peerDependencies = entries.peerDependencies
  }

  return result
}

function dedupeDependencyKeys(dependencyKeys: readonly string[]) {
  return [...new Set(dependencyKeys)]
}

export function resolveManagedDependencies(
  dependencyKeys: readonly string[],
  registry: ManagedDependencyRegistry = dependencyRegistry,
) {
  const dedupedKeys = dedupeDependencyKeys(dependencyKeys)

  assertDependencyKeysExist(dedupedKeys, registry, 'Managed dependency resolution')

  const resolvedEntries: ResolvedManagedDependencyEntry[] = dedupedKeys.map(key => ({
    key,
    dependency: registry[key]!,
  }))

  validateResolvedDependencies(resolvedEntries)

  const resolvedDependencies: ResolvedManagedDependencies = {}

  for (const { dependency } of resolvedEntries) {
    const target = resolvedDependencies[dependency.scope] || {}
    target[dependency.packageName] = formatDependencyRange(dependency.prefix, dependency.version)
    resolvedDependencies[dependency.scope] = target
  }

  return compactResolvedDependencies(resolvedDependencies)
}

export function resolveDependencyPreset(
  presetKey: keyof typeof dependencyPresets | string,
  registry: ManagedDependencyRegistry = dependencyRegistry,
) {
  const dependencyKeys = dependencyPresets[presetKey]

  if (!dependencyKeys) {
    throw ErrorFactory.validation(`Unknown dependency preset: ${presetKey}`)
  }

  return resolveManagedDependencies(dependencyKeys, registry)
}

export function resolveDependencyPresets(
  presetKeys: readonly (keyof typeof dependencyPresets | string)[],
  registry: ManagedDependencyRegistry = dependencyRegistry,
) {
  const dependencyKeys = presetKeys.flatMap((presetKey) => {
    const preset = dependencyPresets[presetKey]

    if (!preset) {
      throw ErrorFactory.validation(`Unknown dependency preset: ${presetKey}`)
    }

    return preset
  })

  return resolveManagedDependencies(dependencyKeys, registry)
}
