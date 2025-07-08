import type { CoreEditor, EditableFiles } from '../core-editor'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IImportFeature {
  addImport: (key: EditableFiles, importCode: string) => this
}

export function withImportFeature<T extends new (...args: any[]) => CoreEditor>(Base: T) {
  return class extends Base implements IImportFeature {
    addImport(key: EditableFiles, importCode: string): this {
      if (!this.contents[key])
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound(key))

      const importAst = recast.parse(`${importCode}\n`).program.body[0]
      this.contents[key].ast.program.body.unshift(importAst)
      return this
    }
  }
}
