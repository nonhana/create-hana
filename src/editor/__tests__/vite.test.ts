import type { IViteFeature } from '../features/vite'
import * as recast from 'recast'
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
    editor = new ExtendedEditor({
      viteConfig: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});`,
      main: `console.log('test');`,
    })
  })

  describe('基本功能测试', () => {
    it('应该成功扩展 CoreEditor 类', () => {
      expect(ExtendedEditor).toBeDefined()
      expect(editor).toBeInstanceOf(CoreEditor)
      expect(editor.addVitePlugin).toBeDefined()
      expect(typeof editor.addVitePlugin).toBe('function')
    })

    it('应该实现 IViteFeature 接口', () => {
      expect(editor.addVitePlugin).toBeDefined()
      expect(typeof editor.addVitePlugin).toBe('function')
    })
  })

  // 辅助函数：从 AST 中获取插件数量
  const getPluginsCount = (ast: any): number => {
    let count = 0
    recast.visit(ast, {
      visitCallExpression(path) {
        const { node } = path
        if (node.callee.type === 'Identifier' && node.callee.name === 'defineConfig') {
          const configObject = node.arguments[0]
          if (configObject && configObject.type === 'ObjectExpression') {
            const pluginsProperty = configObject.properties.find(
              (p: any) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'plugins',
            ) as any
            if (pluginsProperty && pluginsProperty.value && pluginsProperty.value.type === 'ArrayExpression') {
              count = pluginsProperty.value.elements.length
            }
          }
        }
        return false
      },
    })
    return count
  }

  // 辅助函数：检查是否包含特定插件
  const hasPlugin = (ast: any, pluginName: string): boolean => {
    let found = false
    recast.visit(ast, {
      visitCallExpression(path) {
        const { node } = path
        if (node.callee.type === 'Identifier' && node.callee.name === 'defineConfig') {
          const configObject = node.arguments[0]
          if (configObject && configObject.type === 'ObjectExpression') {
            const pluginsProperty = configObject.properties.find(
              (p: any) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'plugins',
            ) as any
            if (pluginsProperty && pluginsProperty.value && pluginsProperty.value.type === 'ArrayExpression') {
              found = pluginsProperty.value.elements.some((element: any) =>
                element && element.type === 'CallExpression'
                && element.callee && element.callee.type === 'Identifier'
                && element.callee.name === pluginName,
              )
            }
          }
        }
        return false
      },
    })
    return found
  }

  describe('addVitePlugin 方法测试', () => {
    describe('成功场景', () => {
      it('应该成功向已有 plugins 数组添加插件', () => {
        const originalCount = getPluginsCount(editor.contents.viteConfig.ast)
        const result = editor.addVitePlugin('viteConfig', 'vue()')

        // 验证返回值是 this (支持链式调用)
        expect(result).toBe(editor)

        // 验证插件数量增加
        const newCount = getPluginsCount(editor.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 1)

        // 验证新插件存在
        expect(hasPlugin(editor.contents.viteConfig.ast, 'vue')).toBe(true)
      })

      it('应该成功向没有 plugins 属性的配置添加插件', () => {
        const editorWithoutPlugins = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite';
export default defineConfig({
  build: { outDir: 'dist' }
});`,
        })

        editorWithoutPlugins.addVitePlugin('viteConfig', 'react()')

        const count = getPluginsCount(editorWithoutPlugins.contents.viteConfig.ast)
        expect(count).toBe(1)
        expect(hasPlugin(editorWithoutPlugins.contents.viteConfig.ast, 'react')).toBe(true)
      })

      it('应该支持链式调用', () => {
        const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

        const result = editor
          .addVitePlugin('viteConfig', 'vue()')
          .addVitePlugin('viteConfig', 'eslint()')

        expect(result).toBe(editor)

        const newCount = getPluginsCount(editor.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 2)

        expect(hasPlugin(editor.contents.viteConfig.ast, 'vue')).toBe(true)
        expect(hasPlugin(editor.contents.viteConfig.ast, 'eslint')).toBe(true)
      })

      it('应该成功处理空的 defineConfig', () => {
        const editorWithEmptyConfig = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite';
export default defineConfig({});`,
        })

        editorWithEmptyConfig.addVitePlugin('viteConfig', 'react()')

        const count = getPluginsCount(editorWithEmptyConfig.contents.viteConfig.ast)
        expect(count).toBe(1)
        expect(hasPlugin(editorWithEmptyConfig.contents.viteConfig.ast, 'react')).toBe(true)
      })

      it('应该成功添加复杂的插件调用', () => {
        const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

        editor.addVitePlugin('viteConfig', 'somePlugin({ option1: true, option2: "value" })')

        const newCount = getPluginsCount(editor.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 1)
        expect(hasPlugin(editor.contents.viteConfig.ast, 'somePlugin')).toBe(true)
      })
    })

    describe('异常场景', () => {
      it('应该在 key 不存在时抛出 HanaError', () => {
        expect(() => {
          editor.addVitePlugin('nonExistentFile' as any, 'react()')
        }).toThrow(HanaError)
      })

      it('应该抛出正确的错误消息', () => {
        const invalidKey = 'nonExistentFile'

        try {
          editor.addVitePlugin(invalidKey as any, 'react()')
        }
        catch (error) {
          expect(error).toBeInstanceOf(HanaError)
          expect((error as HanaError).message).toBe(
            ErrorMessages.validation.fieldNotFound(invalidKey),
          )
        }
      })

      it('应该在传入无效的插件代码时抛出错误', () => {
        expect(() => {
          editor.addVitePlugin('viteConfig', 'const x = 1')
        }).toThrow('pluginCode must be a single expression')
      })

      it('应该在传入非表达式语句时抛出错误', () => {
        expect(() => {
          editor.addVitePlugin('viteConfig', 'function test() { return 1 }')
        }).toThrow('pluginCode must be a single expression')
      })

      it('应该在没有 defineConfig 调用时显示警告', () => {
        const editorWithoutDefineConfig = new ExtendedEditor({
          viteConfig: `const config = { plugins: [] };
export default config;`,
        })

        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

        editorWithoutDefineConfig.addVitePlugin('viteConfig', 'react()')

        expect(consoleSpy).toHaveBeenCalledWith(
          'Warning: Could not find a `defineConfig` call to add the plugin to.',
        )

        consoleSpy.mockRestore()
      })
    })

    describe('边界情况', () => {
      it('应该处理空字符串插件代码', () => {
        expect(() => {
          editor.addVitePlugin('viteConfig', '')
        }).toThrow()
      })

      it('应该处理多个 defineConfig 调用（只处理第一个）', () => {
        const editorWithMultipleConfigs = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite';

const config1 = defineConfig({ plugins: [] });
const config2 = defineConfig({ plugins: [] });

export default config1;`,
        })

        const originalCount = getPluginsCount(editorWithMultipleConfigs.contents.viteConfig.ast)
        editorWithMultipleConfigs.addVitePlugin('viteConfig', 'react()')

        const newCount = getPluginsCount(editorWithMultipleConfigs.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 1)
        expect(hasPlugin(editorWithMultipleConfigs.contents.viteConfig.ast, 'react')).toBe(true)
      })

      it('应该处理注释包含的插件代码', () => {
        const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

        editor.addVitePlugin('viteConfig', 'react() /* React plugin */')

        const newCount = getPluginsCount(editor.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 1)
        expect(hasPlugin(editor.contents.viteConfig.ast, 'react')).toBe(true)
      })
    })

    describe('aST 操作验证', () => {
      it('应该正确解析和插入 AST 节点', () => {
        const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

        editor.addVitePlugin('viteConfig', 'typescript()')

        const newCount = getPluginsCount(editor.contents.viteConfig.ast)
        expect(newCount).toBe(originalCount + 1)
        expect(hasPlugin(editor.contents.viteConfig.ast, 'typescript')).toBe(true)
      })

      it('应该保持原有 AST 结构的完整性', () => {
        const originalAst = JSON.parse(JSON.stringify(editor.contents.viteConfig.ast))

        editor.addVitePlugin('viteConfig', 'vue()')

        const newAst = editor.contents.viteConfig.ast

        // 验证基本结构保持不变
        expect(newAst.type).toBe(originalAst.type)
        expect(newAst.program.type).toBe(originalAst.program.type)
        expect(newAst.program.body.length).toBe(originalAst.program.body.length)
      })
    })
  })

  describe('多个文件操作', () => {
    it('应该能够在不同文件中添加插件', () => {
      const editorWithMultipleFiles = new ExtendedEditor({
        viteConfig: `import { defineConfig } from 'vite';
export default defineConfig({ plugins: [] });`,
        main: `console.log('main');`,
      })

      editorWithMultipleFiles.addVitePlugin('viteConfig', 'react()')

      const count = getPluginsCount(editorWithMultipleFiles.contents.viteConfig.ast)
      expect(count).toBe(1)
      expect(hasPlugin(editorWithMultipleFiles.contents.viteConfig.ast, 'react')).toBe(true)
    })

    it('应该在只有 viteConfig 文件时正常工作', () => {
      const editorWithOnlyVite = new ExtendedEditor({
        viteConfig: `import { defineConfig } from 'vite';
export default defineConfig({});`,
      })

      editorWithOnlyVite.addVitePlugin('viteConfig', 'eslint()')

      const count = getPluginsCount(editorWithOnlyVite.contents.viteConfig.ast)
      expect(count).toBe(1)
      expect(hasPlugin(editorWithOnlyVite.contents.viteConfig.ast, 'eslint')).toBe(true)
    })
  })

  describe('实际使用场景', () => {
    it('应该正确处理常见的 Vite 插件', () => {
      const plugins = [
        'vue()',
        'typescript()',
        'eslint()',
        'legacy({ targets: ["defaults", "not IE 11"] })',
      ]

      const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

      plugins.forEach((plugin) => {
        editor.addVitePlugin('viteConfig', plugin)
      })

      const newCount = getPluginsCount(editor.contents.viteConfig.ast)
      expect(newCount).toBe(originalCount + plugins.length)

      expect(hasPlugin(editor.contents.viteConfig.ast, 'vue')).toBe(true)
      expect(hasPlugin(editor.contents.viteConfig.ast, 'typescript')).toBe(true)
      expect(hasPlugin(editor.contents.viteConfig.ast, 'eslint')).toBe(true)
      expect(hasPlugin(editor.contents.viteConfig.ast, 'legacy')).toBe(true)
    })

    it('应该正确处理带条件的插件配置', () => {
      const originalCount = getPluginsCount(editor.contents.viteConfig.ast)

      editor.addVitePlugin('viteConfig', 'process.env.NODE_ENV === "development" ? devtools() : null')

      const newCount = getPluginsCount(editor.contents.viteConfig.ast)
      expect(newCount).toBe(originalCount + 1)

      // 验证条件表达式被添加
      let hasConditionalExpression = false
      recast.visit(editor.contents.viteConfig.ast, {
        visitCallExpression(path) {
          const { node } = path
          if (node.callee.type === 'Identifier' && node.callee.name === 'defineConfig') {
            const configObject = node.arguments[0]
            if (configObject && configObject.type === 'ObjectExpression') {
              const pluginsProperty = configObject.properties.find(
                (p: any) => p.type === 'Property' && p.key && p.key.type === 'Identifier' && p.key.name === 'plugins',
              )
              if (pluginsProperty && pluginsProperty.value && pluginsProperty.value.type === 'ArrayExpression') {
                hasConditionalExpression = pluginsProperty.value.elements.some((element: any) =>
                  element && element.type === 'ConditionalExpression',
                )
              }
            }
          }
          return false
        },
      })

      expect(hasConditionalExpression).toBe(true)
    })
  })
})
