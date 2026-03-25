import type { ManagedDependencyRegistry } from '../types'
import { describe, expect, it } from 'vitest'
import { resolveDependencyPreset, resolveDependencyPresets, resolveManagedDependencies } from '../resolver'

function createRegistry(): ManagedDependencyRegistry {
  return {
    alpha: {
      packageName: 'alpha',
      version: '1.0.0',
      prefix: '^',
      scope: 'dependencies',
      risk: 'low',
      templateCoupling: 'runtime',
      autoUpdate: {
        patch: true,
        minor: true,
        major: false,
      },
      releaseImpact: 'patch',
    },
    beta: {
      packageName: 'beta',
      version: '2.0.0',
      prefix: '~',
      scope: 'devDependencies',
      risk: 'medium',
      templateCoupling: 'config',
      autoUpdate: {
        patch: true,
        minor: false,
        major: false,
      },
      releaseImpact: 'patch',
    },
    gamma: {
      packageName: 'alpha',
      version: '1.0.0',
      prefix: '^',
      scope: 'devDependencies',
      risk: 'medium',
      templateCoupling: 'config',
      autoUpdate: {
        patch: true,
        minor: false,
        major: false,
      },
      releaseImpact: 'patch',
    },
  }
}

describe('dependency resolver', () => {
  it('dedupes repeated dependency keys', () => {
    const resolved = resolveManagedDependencies(['alpha', 'alpha', 'beta'], createRegistry())

    expect(resolved).toEqual({
      dependencies: {
        alpha: '^1.0.0',
      },
      devDependencies: {
        beta: '~2.0.0',
      },
    })
  })

  it('dedupes repeated presets and keeps output stable', () => {
    const resolved = resolveDependencyPresets(['lang.typescript.base', 'lang.typescript.base'])

    expect(resolved).toEqual(resolveDependencyPreset('lang.typescript.base'))
  })

  it('throws when different keys resolve to the same package with different scopes', () => {
    expect(() => resolveManagedDependencies(['alpha', 'gamma'], createRegistry())).toThrow('conflicting scopes')
  })
})
