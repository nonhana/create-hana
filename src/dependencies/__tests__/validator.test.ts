import type { DependencyScope, ManagedDependency, ManagedDependencyRegistry, ResolvedManagedDependencyEntry } from '../types'
import { describe, expect, it } from 'vitest'
import { validateDependencyPresets, validateDependencyRegistry, validateResolvedDependencies } from '../validator'

function createDependency(packageName: string, scope: DependencyScope): ManagedDependency {
  return {
    packageName,
    version: '1.0.0',
    prefix: '^',
    scope,
    risk: 'low',
    templateCoupling: scope === 'dependencies' ? 'runtime' : 'config',
    autoUpdate: {
      patch: true,
      minor: true,
      major: false,
    },
    releaseImpact: 'patch',
  }
}

function createRegistry(overrides: Partial<ManagedDependencyRegistry> = {}): ManagedDependencyRegistry {
  return {
    foo: createDependency('foo', 'dependencies'),
    bar: createDependency('bar', 'devDependencies'),
    ...overrides,
  }
}

describe('dependency validator', () => {
  it('rejects latest versions in the registry', () => {
    const foo = createDependency('foo', 'dependencies')

    expect(() => validateDependencyRegistry(createRegistry({
      foo: {
        ...foo,
        version: 'latest',
      },
    }))).toThrow('invalid version')
  })

  it('rejects wildcard versions in the registry', () => {
    const foo = createDependency('foo', 'dependencies')

    expect(() => validateDependencyRegistry(createRegistry({
      foo: {
        ...foo,
        version: '*',
      },
    }))).toThrow('invalid version')
  })

  it('rejects invalid npm package names', () => {
    const foo = createDependency('foo', 'dependencies')

    expect(() => validateDependencyRegistry(createRegistry({
      foo: {
        ...foo,
        packageName: 'Foo Package',
      },
    }))).toThrow('invalid package name')
  })

  it('rejects empty presets', () => {
    expect(() => validateDependencyPresets({
      'feature.empty': [],
    }, createRegistry())).toThrow('cannot be empty')
  })

  it('rejects duplicate keys in a preset', () => {
    expect(() => validateDependencyPresets({
      'feature.duplicate': ['foo', 'foo'],
    }, createRegistry())).toThrow('duplicate dependency key')
  })

  it('rejects scope conflicts when different keys resolve to the same package', () => {
    const foo = createDependency('foo', 'dependencies')
    const entries: ResolvedManagedDependencyEntry[] = [
      {
        key: 'foo',
        dependency: foo,
      },
      {
        key: 'foo-dev',
        dependency: {
          ...foo,
          scope: 'devDependencies',
        },
      },
    ]

    expect(() => validateResolvedDependencies(entries)).toThrow('conflicting scopes')
  })
})
