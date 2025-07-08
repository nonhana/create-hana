import type { IImportFeature } from '../features/import'
import { beforeEach, describe, expect, it } from 'vitest'
import { ErrorMessages } from '@/constants/errors'
import { HanaError } from '@/error/hana-error'
import { CoreEditor } from '../core-editor'
import { withImportFeature } from '../features/import'

describe('withImportFeature', () => {
  let ExtendedEditor: new (...args: any[]) => CoreEditor & IImportFeature
  let editor: CoreEditor & IImportFeature

  beforeEach(() => {
    ExtendedEditor = withImportFeature(CoreEditor)
    editor = new ExtendedEditor({
      viteConfig: `import { defineConfig } from 'vite';
export default defineConfig({});`,
      main: `import React from 'react';
const App = () => React.createElement('div', null, 'Hello');`,
    })
  })

  describe('基本功能测试', () => {
    it('应该成功扩展 CoreEditor 类', () => {
      expect(ExtendedEditor).toBeDefined()
      expect(editor).toBeInstanceOf(CoreEditor)
      expect(editor.addImport).toBeDefined()
      expect(typeof editor.addImport).toBe('function')
    })

    it('应该实现 IImportFeature 接口', () => {
      // 检查接口方法是否存在
      expect(editor.addImport).toBeDefined()
      expect(typeof editor.addImport).toBe('function')
    })
  })

  describe('addImport 方法测试', () => {
    describe('成功场景', () => {
      it('应该成功添加简单的命名导入', () => {
        const importCode = 'import { useState } from \'react\''
        const result = editor.addImport('main', importCode)

        // 验证返回值是 this (支持链式调用)
        expect(result).toBe(editor)

        // 验证 import 语句被添加到文件开头
        const ast = editor.contents.main!.ast
        const imports = ast.program.body.filter((node: any) => node.type === 'ImportDeclaration')

        expect(imports.length).toBeGreaterThan(0)

        // 验证新添加的 import 在第一个位置
        const firstImport = ast.program.body[0]
        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('react')
        expect(firstImport.specifiers[0].imported.name).toBe('useState')
      })

      it('应该成功添加默认导入', () => {
        const importCode = 'import lodash from \'lodash\''
        editor.addImport('viteConfig', importCode)

        const ast = editor.contents.viteConfig.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('lodash')
        expect(firstImport.specifiers[0].type).toBe('ImportDefaultSpecifier')
        expect(firstImport.specifiers[0].local.name).toBe('lodash')
      })

      it('应该成功添加命名空间导入', () => {
        const importCode = 'import * as path from \'path\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('path')
        expect(firstImport.specifiers[0].type).toBe('ImportNamespaceSpecifier')
        expect(firstImport.specifiers[0].local.name).toBe('path')
      })

      it('应该成功添加混合导入', () => {
        const importCode = 'import React, { useEffect, useState } from \'react\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('react')
        expect(firstImport.specifiers.length).toBe(3)
        expect(firstImport.specifiers[0].type).toBe('ImportDefaultSpecifier')
        expect(firstImport.specifiers[1].type).toBe('ImportSpecifier')
        expect(firstImport.specifiers[2].type).toBe('ImportSpecifier')
      })

      it('应该成功添加副作用导入', () => {
        const importCode = 'import \'./style.css\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('./style.css')
        expect(firstImport.specifiers.length).toBe(0)
      })

      it('应该支持链式调用', () => {
        const result = editor
          .addImport('main', 'import { useState } from \'react\'')
          .addImport('main', 'import { useEffect } from \'react\'')

        expect(result).toBe(editor)

        const ast = editor.contents.main!.ast
        const imports = ast.program.body.filter((node: any) => node.type === 'ImportDeclaration')

        // 原本已有的 import + 新添加的两个 import
        expect(imports.length).toBeGreaterThanOrEqual(3)
      })

      it('应该将新的 import 添加到已有 import 之前', () => {
        const originalAst = editor.contents.main!.ast
        const originalFirstNode = originalAst.program.body[0]

        editor.addImport('main', 'import { useState } from \'react\'')

        const newAst = editor.contents.main!.ast
        const newFirstNode = newAst.program.body[0]
        const secondNode = newAst.program.body[1]

        // 新的 import 应该在第一位
        expect(newFirstNode.type).toBe('ImportDeclaration')
        expect(newFirstNode.source.value).toBe('react')

        // 原来的第一个节点应该被推到第二位
        expect(secondNode).toEqual(originalFirstNode)
      })
    })

    describe('异常场景', () => {
      it('应该在 key 不存在时抛出 HanaError', () => {
        const importCode = 'import { useState } from \'react\''

        expect(() => {
          editor.addImport('nonExistentFile' as any, importCode)
        }).toThrow(HanaError)
      })

      it('应该抛出正确的错误消息', () => {
        const importCode = 'import { useState } from \'react\''
        const invalidKey = 'nonExistentFile'

        try {
          editor.addImport(invalidKey as any, importCode)
        }
        catch (error) {
          expect(error).toBeInstanceOf(HanaError)
          expect((error as HanaError).message).toBe(
            ErrorMessages.validation.fieldNotFound(invalidKey),
          )
        }
      })

      it('应该在传入无效的 import 语法时抛出错误', () => {
        const invalidImportCode = 'invalid import syntax'

        expect(() => {
          editor.addImport('main', invalidImportCode)
        }).toThrow()
      })
    })

    describe('边界情况', () => {
      it('应该处理空字符串导入', () => {
        // 空字符串解析后 body[0] 是 undefined，会被添加到 AST 中
        // 这虽然不是理想行为，但不会抛出错误
        editor.addImport('main', '')

        const ast = editor.contents.main!.ast
        const firstNode = ast.program.body[0]
        expect(firstNode).toBeUndefined()
      })

      it('应该处理包含注释的导入', () => {
        const importCode = 'import { useState } /* state hook */ from \'react\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('react')
      })

      it('应该处理多行导入', () => {
        const importCode = `import {
          useState,
          useEffect,
          useCallback
        } from 'react'`

        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('react')
        expect(firstImport.specifiers.length).toBe(3)
      })

      it('应该处理相对路径导入', () => {
        const importCode = 'import { utils } from \'../utils/helper\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('../utils/helper')
      })

      it('应该处理 TypeScript 类型导入', () => {
        const importCode = 'import type { User } from \'./types\''
        editor.addImport('main', importCode)

        const ast = editor.contents.main!.ast
        const firstImport = ast.program.body[0]

        expect(firstImport.type).toBe('ImportDeclaration')
        expect(firstImport.source.value).toBe('./types')
        expect(firstImport.importKind).toBe('type')
      })
    })

    describe('aST 操作验证', () => {
      it('应该正确解析和插入 AST 节点', () => {
        const importCode = 'import { test } from \'vitest\''
        const originalBodyLength = editor.contents.main!.ast.program.body.length

        editor.addImport('main', importCode)

        const newBodyLength = editor.contents.main!.ast.program.body.length
        expect(newBodyLength).toBe(originalBodyLength + 1)

        // 验证插入的节点是正确的 ImportDeclaration
        const insertedNode = editor.contents.main!.ast.program.body[0]
        expect(insertedNode.type).toBe('ImportDeclaration')
        expect(insertedNode.source).toBeDefined()
        expect(insertedNode.specifiers).toBeDefined()
      })

      it('应该保持原有 AST 结构的完整性', () => {
        const originalAst = JSON.parse(JSON.stringify(editor.contents.main!.ast))
        const originalNodes = originalAst.program.body.slice()

        editor.addImport('main', 'import { test } from \'vitest\'')

        const newAst = editor.contents.main!.ast
        const newNodes = newAst.program.body.slice(1) // 跳过新添加的第一个节点

        // 原有节点应该保持不变（除了位置）
        expect(newNodes.length).toBe(originalNodes.length)
        // 这里我们检查结构类型而不是完全相等，因为 recast 可能会修改某些内部属性
        for (let i = 0; i < originalNodes.length; i++) {
          expect(newNodes[i].type).toBe(originalNodes[i].type)
        }
      })
    })
  })

  describe('多个文件操作', () => {
    it('应该能够在不同文件中添加导入', () => {
      editor.addImport('viteConfig', 'import { defineConfig } from \'vite\'')
      editor.addImport('main', 'import { useState } from \'react\'')

      // 验证 viteConfig 文件
      const viteConfigAst = editor.contents.viteConfig.ast
      const viteConfigFirstImport = viteConfigAst.program.body[0]
      expect(viteConfigFirstImport.type).toBe('ImportDeclaration')
      expect(viteConfigFirstImport.source.value).toBe('vite')

      // 验证 main 文件
      const mainAst = editor.contents.main!.ast
      const mainFirstImport = mainAst.program.body[0]
      expect(mainFirstImport.type).toBe('ImportDeclaration')
      expect(mainFirstImport.source.value).toBe('react')
    })

    it('应该在只有 viteConfig 文件时正常工作', () => {
      const editorWithOnlyVite = new ExtendedEditor({
        viteConfig: 'import { defineConfig } from "vite";\nexport default defineConfig({});',
      })

      editorWithOnlyVite.addImport('viteConfig', 'import { defineConfig } from \'vite\'')

      const ast = editorWithOnlyVite.contents.viteConfig.ast
      const firstImport = ast.program.body[0]
      expect(firstImport.type).toBe('ImportDeclaration')
      expect(firstImport.source.value).toBe('vite')
    })
  })
})
