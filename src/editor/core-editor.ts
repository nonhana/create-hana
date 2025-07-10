import * as recast from 'recast'
import { parser } from '@/utils/parser'

interface CodeDetail {
  source: string
  ast: any // recast default type
}

export interface CoreEditorContents {
  viteConfig: CodeDetail
  main?: CodeDetail
}

export type EditableFiles = keyof CoreEditorContents

type CoreEditorOptions = {
  [K in EditableFiles]?: string
}

export class CoreEditor {
  public contents: CoreEditorContents

  constructor(contents?: CoreEditorOptions) {
    this.contents = Object.entries(contents ?? {}).reduce((acc, [key, value]) => {
      acc[key as EditableFiles] = {
        source: value,
        ast: recast.parse(value, { parser }),
      }
      return acc
    }, {} as CoreEditorContents)
  }

  public getContent(key: EditableFiles): string {
    return this.contents[key]?.source ?? ''
  }
}
