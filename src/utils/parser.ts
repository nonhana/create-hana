import type { File } from '@babel/types'
import babelParser from '@babel/parser'

export const parser = {
  parse(source: string): File {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })
  },
}
