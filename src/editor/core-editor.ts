import babelParser from '@babel/parser'
import * as recast from 'recast'

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
        ast: recast.parse(value, {
          parser: {
            parse(source: string) {
              return babelParser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
            },
          },
        }),
      }
      return acc
    }, {} as CoreEditorContents)
  }

  public getContent(key: EditableFiles): string {
    return this.contents[key]?.source ?? ''
  }
}
