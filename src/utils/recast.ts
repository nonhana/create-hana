import * as recast from 'recast'

export const RECAST_PRINT_OPTIONS: recast.Options = {
  quote: 'single',
}

export function printAst(ast: any): string {
  return recast.print(ast, RECAST_PRINT_OPTIONS).code
}
