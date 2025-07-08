import type { IJsxProviderFeature } from '../features/jsx-provider'
import * as recast from 'recast'
import { beforeEach, describe, expect, it } from 'vitest'
import { ErrorMessages } from '@/constants/errors'
import { HanaError } from '@/error/hana-error'
import { CoreEditor } from '../core-editor'
import { withJsxProviderFeature } from '../features/jsx-provider'

describe('withJsxProviderFeature', () => {
  let ExtendedEditor: new (...args: any[]) => CoreEditor & IJsxProviderFeature
  let editor: CoreEditor & IJsxProviderFeature

  beforeEach(() => {
    ExtendedEditor = withJsxProviderFeature(CoreEditor)
    editor = new ExtendedEditor({
      main: `import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)`,
      viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
    })
  })

  // 辅助函数：检查 JSX 元素是否被特定组件包装
  const isWrappedBy = (ast: any, componentName: string): boolean => {
    let isWrapped = false
    recast.visit(ast, {
      visitCallExpression(path) {
        const { node } = path
        if (node.callee.type === 'MemberExpression'
          && node.callee.property.type === 'Identifier'
          && node.callee.property.name === 'render') {
          if (node.arguments.length > 0) {
            const jsxElement = node.arguments[0]
            if (jsxElement && jsxElement.type === 'JSXElement') {
              const openingElement = jsxElement.openingElement
              if (openingElement.name.type === 'JSXIdentifier'
                && openingElement.name.name === componentName) {
                isWrapped = true
              }
            }
          }
        }
        this.traverse(path)
        return false
      },
    })
    return isWrapped
  }

  // 辅助函数：获取 JSX 元素的 props
  const getJsxProps = (ast: any, componentName: string): Record<string, string> => {
    const props: Record<string, string> = {}
    recast.visit(ast, {
      visitCallExpression(path) {
        const { node } = path
        if (node.callee.type === 'MemberExpression'
          && node.callee.property.type === 'Identifier'
          && node.callee.property.name === 'render') {
          if (node.arguments.length > 0) {
            const jsxElement = node.arguments[0]
            if (jsxElement && jsxElement.type === 'JSXElement') {
              const openingElement = jsxElement.openingElement
              if (openingElement.name.type === 'JSXIdentifier'
                && openingElement.name.name === componentName) {
                openingElement.attributes?.forEach((attr: any) => {
                  if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
                    const key = attr.name.name
                    if (attr.value && attr.value.type === 'JSXExpressionContainer') {
                      if (attr.value.expression.type === 'Identifier') {
                        props[key] = attr.value.expression.name
                      }
                    }
                  }
                })
              }
            }
          }
        }
        this.traverse(path)
        return false
      },
    })
    return props
  }

  // 辅助函数：获取 JSX 子元素数量
  const getChildrenCount = (ast: any, componentName: string): number => {
    let childrenCount = 0
    recast.visit(ast, {
      visitCallExpression(path) {
        const { node } = path
        if (node.callee.type === 'MemberExpression'
          && node.callee.property.type === 'Identifier'
          && node.callee.property.name === 'render') {
          if (node.arguments.length > 0) {
            const jsxElement = node.arguments[0]
            if (jsxElement && jsxElement.type === 'JSXElement') {
              const openingElement = jsxElement.openingElement
              if (openingElement.name.type === 'JSXIdentifier'
                && openingElement.name.name === componentName) {
                childrenCount = jsxElement.children ? jsxElement.children.length : 0
              }
            }
          }
        }
        this.traverse(path)
        return false
      },
    })
    return childrenCount
  }

  describe('基本功能测试', () => {
    it('应该成功扩展 CoreEditor 类', () => {
      expect(ExtendedEditor).toBeDefined()
      expect(editor).toBeInstanceOf(CoreEditor)
      expect(editor.addJsxProvider).toBeDefined()
      expect(typeof editor.addJsxProvider).toBe('function')
    })

    it('应该实现 IJsxProviderFeature 接口', () => {
      expect(editor.addJsxProvider).toBeDefined()
      expect(typeof editor.addJsxProvider).toBe('function')
    })
  })

  describe('addJsxProvider 方法测试', () => {
    describe('成功场景', () => {
      it('应该成功添加不带 props 的 JSX 提供者', () => {
        const result = editor.addJsxProvider('RouterProvider')

        // 验证返回值是 this (支持链式调用)
        expect(result).toBe(editor)

        // 验证 JSX 元素被 RouterProvider 包装
        expect(isWrappedBy(editor.contents.main!.ast, 'RouterProvider')).toBe(true)

        // 验证子元素存在
        expect(getChildrenCount(editor.contents.main!.ast, 'RouterProvider')).toBe(1)

        // 验证生成的代码正确更新
        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<RouterProvider>')
        expect(generatedCode).toContain('</RouterProvider>')
        expect(generatedCode).toContain('<App />')
      })

      it('应该成功添加带单个 prop 的 JSX 提供者', () => {
        editor.addJsxProvider('RouterProvider', { router: 'router' })

        // 验证 JSX 元素被包装
        expect(isWrappedBy(editor.contents.main!.ast, 'RouterProvider')).toBe(true)

        // 验证 props 被正确设置
        const props = getJsxProps(editor.contents.main!.ast, 'RouterProvider')
        expect(props.router).toBe('router')

        // 验证生成的代码
        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<RouterProvider router={router}>')
        expect(generatedCode).toContain('</RouterProvider>')
      })

      it('应该成功添加带多个 props 的 JSX 提供者', () => {
        editor.addJsxProvider('QueryProvider', {
          client: 'queryClient',
          context: 'defaultContext',
        })

        // 验证 JSX 元素被包装
        expect(isWrappedBy(editor.contents.main!.ast, 'QueryProvider')).toBe(true)

        // 验证 props 被正确设置
        const props = getJsxProps(editor.contents.main!.ast, 'QueryProvider')
        expect(props.client).toBe('queryClient')
        expect(props.context).toBe('defaultContext')

        // 验证生成的代码
        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('client={queryClient}')
        expect(generatedCode).toContain('context={defaultContext}')
      })

      it('应该支持链式调用', () => {
        const result = editor
          .addJsxProvider('RouterProvider', { router: 'router' })
          .addJsxProvider('QueryProvider', { client: 'queryClient' })

        expect(result).toBe(editor)

        // 验证嵌套结构：QueryProvider > RouterProvider > App
        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<QueryProvider client={queryClient}>')
        expect(generatedCode).toContain('<RouterProvider router={router}>')
        expect(generatedCode).toContain('<App />')
        expect(generatedCode).toContain('</RouterProvider>')
        expect(generatedCode).toContain('</QueryProvider>')
      })

      it('应该支持多层嵌套的提供者', () => {
        editor
          .addJsxProvider('ThemeProvider', { theme: 'darkTheme' })
          .addJsxProvider('RouterProvider', { router: 'router' })
          .addJsxProvider('QueryProvider', { client: 'queryClient' })

        const generatedCode = editor.getContent('main')

        // 验证嵌套顺序：最后添加的在最外层
        const queryIndex = generatedCode.indexOf('<QueryProvider')
        const routerIndex = generatedCode.indexOf('<RouterProvider')
        const themeIndex = generatedCode.indexOf('<ThemeProvider')
        const appIndex = generatedCode.indexOf('<App')

        expect(queryIndex).toBeLessThan(routerIndex)
        expect(routerIndex).toBeLessThan(themeIndex)
        expect(themeIndex).toBeLessThan(appIndex)
      })
    })

    describe('异常场景', () => {
      it('应该在 main 文件不存在时抛出 HanaError', () => {
        const editorWithoutMain = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
        })

        expect(() => {
          editorWithoutMain.addJsxProvider('RouterProvider')
        }).toThrow(HanaError)
      })

      it('应该抛出正确的错误消息', () => {
        const editorWithoutMain = new ExtendedEditor({
          viteConfig: `import { defineConfig } from 'vite'
export default defineConfig({})`,
        })

        try {
          editorWithoutMain.addJsxProvider('RouterProvider')
        }
        catch (error) {
          expect(error).toBeInstanceOf(HanaError)
          expect((error as HanaError).message).toBe(
            ErrorMessages.validation.fieldNotFound('main'),
          )
        }
      })

      it('应该在没有 render 调用的文件中正常运行但不修改内容', () => {
        const editorWithoutRender = new ExtendedEditor({
          main: `import React from 'react'

function App() {
  return React.createElement('div', null, 'Hello')
}`,
        })

        const originalCode = editorWithoutRender.getContent('main')
        editorWithoutRender.addJsxProvider('RouterProvider')
        const newCode = editorWithoutRender.getContent('main')

        // 由于没有 render 调用，内容应该保持不变
        expect(newCode).toBe(originalCode)
      })
    })

    describe('边界情况', () => {
      it('应该处理空的 props 对象', () => {
        editor.addJsxProvider('RouterProvider', {})

        expect(isWrappedBy(editor.contents.main!.ast, 'RouterProvider')).toBe(true)

        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<RouterProvider>')
        expect(generatedCode).not.toContain('router={')
      })

      it('应该处理特殊字符的组件名', () => {
        editor.addJsxProvider('My_Special$Component')

        expect(isWrappedBy(editor.contents.main!.ast, 'My_Special$Component')).toBe(true)

        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<My_Special$Component>')
        expect(generatedCode).toContain('</My_Special$Component>')
      })

      it('应该处理单个字符的组件名', () => {
        editor.addJsxProvider('A')

        expect(isWrappedBy(editor.contents.main!.ast, 'A')).toBe(true)

        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('<A>')
        expect(generatedCode).toContain('</A>')
      })

      it('应该正确更新 source 代码', () => {
        const originalCode = editor.getContent('main')
        expect(originalCode).toContain('<App />')
        expect(originalCode).not.toContain('<RouterProvider>')

        editor.addJsxProvider('RouterProvider')

        const updatedCode = editor.getContent('main')
        expect(updatedCode).toContain('<RouterProvider>')
        expect(updatedCode).toContain('<App />')
        expect(updatedCode).not.toBe(originalCode)
      })

      it('应该处理复杂的 prop 值', () => {
        editor.addJsxProvider('ComplexProvider', {
          config: 'appConfig.nested.value',
          state: 'store.getState()',
          callback: 'handleCallback',
        })

        const generatedCode = editor.getContent('main')
        expect(generatedCode).toContain('config={appConfig.nested.value}')
        expect(generatedCode).toContain('state={store.getState()}')
        expect(generatedCode).toContain('callback={handleCallback}')
      })
    })

    describe('性能和稳定性测试', () => {
      it('应该能处理多次连续调用', () => {
        for (let i = 0; i < 5; i++) {
          editor.addJsxProvider(`Provider${i}`)
        }

        const generatedCode = editor.getContent('main')

        // 验证所有提供者都被添加
        for (let i = 4; i >= 0; i--) {
          expect(generatedCode).toContain(`<Provider${i}>`)
          expect(generatedCode).toContain(`</Provider${i}>`)
        }
      })

      it('应该在重复添加相同提供者时正常工作', () => {
        editor.addJsxProvider('RouterProvider')
        editor.addJsxProvider('RouterProvider')

        const generatedCode = editor.getContent('main')

        // 应该有两层嵌套的 RouterProvider
        const matches = generatedCode.match(/<RouterProvider>/g)
        expect(matches).toHaveLength(2)
      })
    })
  })
})
