import type { CoreEditor, EditableFiles } from '../core-editor'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { parser } from '@/utils/parser'

export interface ICommonFeature {
  addImport: (key: EditableFiles, code: string) => this
  addCode: (key: EditableFiles, code: string) => this
}

export function withCommonFeature<TBase extends new (...args: any[]) => CoreEditor>(Base: TBase) {
  return class extends Base implements ICommonFeature {
    addImport(key: EditableFiles, importCode: string): this {
      if (!this.contents[key])
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound(key))

      const importAst = recast.parse(`${importCode}\n`, { parser }).program.body[0]
      this.contents[key].ast.program.body.unshift(importAst)
      return this
    }

    addCode(key: EditableFiles, code: string): this {
      if (!this.contents[key])
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound(key))

      const ast = this.contents[key].ast

      const codeAst = recast.parse(code, { parser })

      let lastImportIndex = -1
      for (let i = 0; i < ast.program.body.length; i++) {
        const node = ast.program.body[i]
        if (node.type === 'ImportDeclaration') {
          lastImportIndex = i
        }
      }

      if (lastImportIndex >= 0) {
        const codeStatements = codeAst.program.body
        ast.program.body.splice(lastImportIndex + 1, 0, ...codeStatements)
      }
      else {
        ast.program.body.unshift(...codeAst.program.body)
      }

      return this
    }
  }
}
