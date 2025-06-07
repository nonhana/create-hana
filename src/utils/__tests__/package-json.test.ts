import type { PackageJsonConfig } from '@/types'
import { describe, expect, it } from 'vitest'
import { addDependencies, addScripts, mergePackageJson, sortPackageJson } from '../package-json'

describe('package-json utils', () => {
  describe('mergePackageJson', () => {
    it('should merge multiple package.json configurations', () => {
      const config1: Partial<PackageJsonConfig> = {
        name: 'test-package',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
        },
      }

      const config2: Partial<PackageJsonConfig> = {
        description: 'A test package',
        dependencies: {
          vue: '^3.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      }

      const result = mergePackageJson(config1, config2)

      expect(result.name).toBe('test-package')
      expect(result.version).toBe('1.0.0')
      expect(result.description).toBe('A test package')
      expect(result.dependencies).toEqual({
        react: '^18.0.0',
        vue: '^3.0.0',
      })
      expect(result.devDependencies).toEqual({
        typescript: '^5.0.0',
      })
    })

    it('should handle empty configurations', () => {
      const result = mergePackageJson({})
      expect(result.name).toBe('')
      expect(result.version).toBe('1.0.0')
    })
  })

  describe('addDependencies', () => {
    it('should add dependencies to package.json', () => {
      const packageJson: PackageJsonConfig = {
        name: 'test',
        version: '1.0.0',
      }

      addDependencies(packageJson, {
        react: '^18.0.0',
        vue: '^3.0.0',
      })

      expect(packageJson.dependencies).toEqual({
        react: '^18.0.0',
        vue: '^3.0.0',
      })
    })

    it('should add devDependencies to package.json', () => {
      const packageJson: PackageJsonConfig = {
        name: 'test',
        version: '1.0.0',
      }

      addDependencies(packageJson, {
        typescript: '^5.0.0',
        vitest: '^1.0.0',
      }, 'devDependencies')

      expect(packageJson.devDependencies).toEqual({
        typescript: '^5.0.0',
        vitest: '^1.0.0',
      })
    })

    it('should merge with existing dependencies', () => {
      const packageJson: PackageJsonConfig = {
        name: 'test',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
        },
      }

      addDependencies(packageJson, {
        vue: '^3.0.0',
      })

      expect(packageJson.dependencies).toEqual({
        react: '^18.0.0',
        vue: '^3.0.0',
      })
    })
  })

  describe('addScripts', () => {
    it('should add scripts to package.json', () => {
      const packageJson: PackageJsonConfig = {
        name: 'test',
        version: '1.0.0',
      }

      addScripts(packageJson, {
        build: 'tsc',
        test: 'vitest',
      })

      expect(packageJson.scripts).toEqual({
        build: 'tsc',
        test: 'vitest',
      })
    })

    it('should merge with existing scripts', () => {
      const packageJson: PackageJsonConfig = {
        name: 'test',
        version: '1.0.0',
        scripts: {
          start: 'node index.js',
        },
      }

      addScripts(packageJson, {
        build: 'tsc',
        test: 'vitest',
      })

      expect(packageJson.scripts).toEqual({
        start: 'node index.js',
        build: 'tsc',
        test: 'vitest',
      })
    })
  })

  describe('sortPackageJson', () => {
    it('should sort package.json keys in conventional order', () => {
      const packageJson: PackageJsonConfig = {
        scripts: { build: 'tsc' },
        name: 'test',
        devDependencies: { typescript: '^5.0.0' },
        version: '1.0.0',
        dependencies: { react: '^18.0.0' },
        description: 'A test package',
      }

      const sorted = sortPackageJson(packageJson)
      const keys = Object.keys(sorted)

      expect(keys.indexOf('name')).toBeLessThan(keys.indexOf('version'))
      expect(keys.indexOf('version')).toBeLessThan(keys.indexOf('description'))
      expect(keys.indexOf('description')).toBeLessThan(keys.indexOf('scripts'))
      expect(keys.indexOf('scripts')).toBeLessThan(keys.indexOf('dependencies'))
      expect(keys.indexOf('dependencies')).toBeLessThan(keys.indexOf('devDependencies'))
    })
  })
})
