import type { IViteFeature } from '../features/vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorMessages } from '@/constants/errors'
import { HanaError } from '@/error/hana-error'
import { CoreEditor } from '../core-editor'
import { withViteFeature } from '../features/vite'

describe('withViteFeature', () => {
  let ExtendedEditor: new (...args: any[]) => CoreEditor & IViteFeature
  let editor: CoreEditor & IViteFeature

  beforeEach(() => {
    ExtendedEditor = withViteFeature(CoreEditor)
  })

  describe('基本功能测试', () => {
    beforeEach(() => {
      editor = new ExtendedEditor({
        viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
      })
    })

    it('应该成功扩展 CoreEditor 类', () => {
      expect(ExtendedEditor).toBeDefined()
      expect(editor).toBeInstanceOf(CoreEditor)
      expect(editor.addVitePlugin).toBeDefined()
      expect(editor.addViteAlias).toBeDefined()
      expect(typeof editor.addVitePlugin).toBe('function')
      expect(typeof editor.addViteAlias).toBe('function')
    })

    it('应该实现 IViteFeature 接口', () => {
      expect(editor.addVitePlugin).toBeDefined()
      expect(editor.addViteAlias).toBeDefined()
      expect(typeof editor.addVitePlugin).toBe('function')
      expect(typeof editor.addViteAlias).toBe('function')
    })
  })

  describe('addVitePlugin 方法测试', () => {
    describe('成功场景', () => {
      beforeEach(() => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
        })
      })

      it('应该在空配置对象中添加 plugin', () => {
        const result = editor.addVitePlugin('react()')

        // 验证返回值是 this (支持链式调用)
        expect(result).toBe(editor)

        // 验证生成的代码
        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react()]')
        expect(generatedCode).toContain('export default defineConfig')
      })

      it('应该在已有 plugins 数组中添加新插件', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
})`,
        })

        editor.addVitePlugin('legacy()')

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react(), legacy()]')
      })

      it('应该处理复杂的插件表达式', () => {
        editor.addVitePlugin('react({ jsxRuntime: "automatic" })')

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react({ jsxRuntime: "automatic" })]')
      })

      it('应该支持链式调用', () => {
        const result = editor
          .addVitePlugin('react()')
          .addVitePlugin('legacy()')

        expect(result).toBe(editor)

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react(), legacy()]')
      })
    })

    describe('错误场景', () => {
      it('应该在 viteConfig 不存在时抛出错误', () => {
        editor = new ExtendedEditor({})

        expect(() => editor.addVitePlugin('react()')).toThrow(HanaError)
        expect(() => editor.addVitePlugin('react()')).toThrow(
          ErrorMessages.validation.fieldNotFound('viteConfig'),
        )
      })

      it('应该在插件代码不是表达式时抛出错误', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
        })

        expect(() => editor.addVitePlugin('const plugin = react()')).toThrow(
          'pluginCode must be a single expression, e.g., "react()"',
        )
      })
    })

    describe('边界情况', () => {
      it('应该处理没有 defineConfig 的配置文件', () => {
        editor = new ExtendedEditor({
          viteConfig: `const config = { plugins: [] }`,
        })

        // 使用 console.warn spy 来验证警告
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        editor.addVitePlugin('react()')

        expect(consoleSpy).toHaveBeenCalledWith('Warning: Could not find a `defineConfig` call to add the plugin to.')

        consoleSpy.mockRestore()
      })

      it('应该处理已有其他配置属性的情况', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  build: {
    outDir: 'dist'
  }
})`,
        })

        editor.addVitePlugin('react()')

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react()]')
        expect(generatedCode).toContain('build: {')
        expect(generatedCode).toContain('outDir: \'dist\'')
      })
    })
  })

  describe('addViteAlias 方法测试', () => {
    describe('成功场景', () => {
      beforeEach(() => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
        })
      })

      it('应该在空配置对象中添加 alias', () => {
        const result = editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        // 验证返回值是 this (支持链式调用)
        expect(result).toBe(editor)

        // 验证生成的代码
        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
      })

      it('应该在已有 resolve 配置中添加 alias', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx']
  }
})`,
        })

        editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('extensions: [')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
      })

      it('应该在已有 alias 配置中添加新别名', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  resolve: {
    alias: {
      '@utils': 'path.resolve(__dirname, "src/utils")'
    }
  }
})`,
        })

        editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
        // 原有的 @utils 应该保持原来的字符串格式
        expect(generatedCode).toContain('\'@utils\': \'path.resolve(__dirname, "src/utils")\'')
        // 或者可以接受任何包含 @utils 和 src/utils 的格式
        expect(generatedCode).toContain('@utils')
        expect(generatedCode).toContain('src/utils')
      })

      it('应该添加多个别名', () => {
        editor.addViteAlias({
          '@': 'path.resolve(__dirname, "src")',
          '@components': 'path.resolve(__dirname, "src/components")',
          '@utils': 'path.resolve(__dirname, "src/utils")',
        })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
        expect(generatedCode).toContain('"@components": path.resolve(__dirname, "src/components")')
        expect(generatedCode).toContain('"@utils": path.resolve(__dirname, "src/utils")')
      })

      it('应该跳过已存在的别名', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  resolve: {
    alias: {
      '@': 'path.resolve(__dirname, "existing")'
    }
  }
})`,
        })

        editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('"existing"')
        expect(generatedCode).not.toContain('"src")')
      })

      it('应该支持链式调用', () => {
        const result = editor
          .addViteAlias({ '@': 'path.resolve(__dirname, "src")' })
          .addViteAlias({ '@components': 'path.resolve(__dirname, "src/components")' })

        expect(result).toBe(editor)

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
        expect(generatedCode).toContain('"@components": path.resolve(__dirname, "src/components")')
      })

      it('应该支持与 addVitePlugin 的链式调用', () => {
        const result = editor
          .addVitePlugin('react()')
          .addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        expect(result).toBe(editor)

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react()]')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
      })
    })

    describe('错误场景', () => {
      it('应该在 viteConfig 不存在时抛出错误', () => {
        editor = new ExtendedEditor({})

        expect(() => editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })).toThrow(HanaError)
        expect(() => editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })).toThrow(
          ErrorMessages.validation.fieldNotFound('viteConfig'),
        )
      })
    })

    describe('边界情况', () => {
      it('应该处理没有 defineConfig 的配置文件', () => {
        editor = new ExtendedEditor({
          viteConfig: `const config = { resolve: { alias: {} } }`,
        })

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        expect(consoleSpy).toHaveBeenCalledWith('Warning: Could not find a `defineConfig` call to add the alias to.')

        consoleSpy.mockRestore()
      })

      it('应该处理已有其他配置属性的情况', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})`,
        })

        editor.addViteAlias({ '@': 'path.resolve(__dirname, "src")' })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('plugins: [react()]')
        expect(generatedCode).toContain('build: {')
        expect(generatedCode).toContain('resolve: {')
        expect(generatedCode).toContain('alias: {')
        expect(generatedCode).toContain('"@": path.resolve(__dirname, "src")')
      })

      it('应该处理复杂的别名值表达式', () => {
        editor = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})`,
        })

        editor.addViteAlias({
          '@': 'path.resolve(__dirname, "src")',
          '@api': 'path.join(process.cwd(), "src", "api")',
          '@assets': '"./src/assets"',
        })

        const generatedCode = editor.getContent('viteConfig')
        expect(generatedCode).toContain('path.resolve(__dirname, "src")')
        expect(generatedCode).toContain('path.join(process.cwd(), "src", "api")')
        expect(generatedCode).toContain('"./src/assets"')
      })
    })
  })
})
