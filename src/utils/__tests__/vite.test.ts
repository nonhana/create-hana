import { describe, expect, it } from 'vitest'
import { addViteImport, addVitePlugin } from '../vite'

describe('vite utils', () => {
  describe('addViteImport', () => {
    it('should add import to empty code', () => {
      const code = ''
      const importCode = 'import react from \'@vitejs/plugin-react\''
      const result = addViteImport(code, importCode)

      expect(result).toContain('import react from \'@vitejs/plugin-react\'')
    })

    it('should add import to the beginning of existing code', () => {
      const code = `export default defineConfig({
  plugins: [],
})`
      const importCode = 'import react from \'@vitejs/plugin-react\''
      const result = addViteImport(code, importCode)

      expect(result).toMatch(/^import react from '@vitejs\/plugin-react'/)
      expect(result).toContain('export default defineConfig')
    })

    it('should add import before existing imports', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`
      const importCode = 'import react from \'@vitejs/plugin-react\''
      const result = addViteImport(code, importCode)

      const lines = result.split('\n')
      expect(lines[0]).toContain('import react from \'@vitejs/plugin-react\'')
      expect(lines[1]).toContain('import { defineConfig } from \'vite\'')
    })

    it('should handle multiple imports being added', () => {
      let code = `export default defineConfig({
  plugins: [],
})`

      code = addViteImport(code, 'import react from \'@vitejs/plugin-react\'')
      code = addViteImport(code, 'import { defineConfig } from \'vite\'')

      const lines = code.split('\n').filter(line => line.trim())
      expect(lines[0]).toContain('import { defineConfig } from \'vite\'')
      expect(lines[1]).toContain('import react from \'@vitejs/plugin-react\'')
    })
  })

  describe('addVitePlugin', () => {
    it('should add plugin to existing plugins array', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [react()]')
    })

    it('should add plugin to existing plugins with other plugins', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [someOtherPlugin()],
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [someOtherPlugin(), react()]')
    })

    it('should create plugins property when it does not exist', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  }
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [react()]')
      expect(result).toContain('build: {')
    })

    it('should create plugins property in empty config object', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [react()]')
    })

    it('should handle complex plugin expressions', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`
      const pluginCode = 'react({ jsxRuntime: "automatic" })'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [react({ jsxRuntime: "automatic" })]')
    })

    it('should handle multiple plugins being added', () => {
      let code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`

      code = addVitePlugin(code, 'react()')
      code = addVitePlugin(code, 'legacy()')

      expect(code).toContain('plugins: [react(), legacy()]')
    })

    it('should work with different defineConfig styles', () => {
      const code = `export default defineConfig({
  plugins: []
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('plugins: [react()]')
    })

    it('should throw error for invalid plugin code', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
})`
      const invalidPluginCode = 'const plugin = react()'

      expect(() => addVitePlugin(code, invalidPluginCode)).toThrow(
        'pluginCode must be a single expression, e.g., "react()"',
      )
    })

    it('should handle code without defineConfig gracefully', () => {
      const code = `const config = {
  plugins: []
}`
      const pluginCode = 'react()'

      // 这个应该不会修改代码，因为找不到 defineConfig
      const result = addVitePlugin(code, pluginCode)
      expect(result).toBe(code) // 代码应该保持不变
    })

    it('should preserve code formatting and comments', () => {
      const code = `import { defineConfig } from 'vite'

// This is a comment
export default defineConfig({
  // Another comment
  plugins: [], // Inline comment
  build: {
    outDir: 'dist'
  }
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      expect(result).toContain('// This is a comment')
      expect(result).toContain('// Another comment')
      expect(result).toContain('// Inline comment')
      expect(result).toContain('plugins: [react()]')
    })

    it('should handle nested defineConfig calls', () => {
      const code = `import { defineConfig } from 'vite'

export default defineConfig((command) => {
  return defineConfig({
    plugins: []
  })
})`
      const pluginCode = 'react()'
      const result = addVitePlugin(code, pluginCode)

      // 对于嵌套的 defineConfig，当前实现无法处理外层的函数形式
      // 所以代码应该保持不变
      expect(result).toBe(code)
    })
  })
})
