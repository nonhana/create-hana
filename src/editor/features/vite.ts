import type { CoreEditor, EditableFiles } from '../core-editor'
import * as recast from 'recast'
import typescriptParser from 'recast/parsers/typescript'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IViteFeature {
  addVitePlugin: (key: EditableFiles, pluginCode: string) => this
}

export function withViteFeature<T extends new (...args: any[]) => CoreEditor>(Base: T) {
  return class extends Base implements IViteFeature {
    addVitePlugin(key: EditableFiles, pluginCode: string): this {
      if (!this.contents[key])
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound(key))

      const ast = this.contents[key].ast

      const pluginAst = recast.parse(pluginCode, { parser: typescriptParser }).program.body[0]
      if (pluginAst.type !== 'ExpressionStatement') {
        throw new Error('pluginCode must be a single expression, e.g., "react()"')
      }
      const pluginNode = pluginAst.expression

      let pluginAdded = false

      recast.visit(ast, {
        visitCallExpression(path) {
          const { node } = path
          if (node.callee.type === 'Identifier' && node.callee.name === 'defineConfig') {
            const configObject = node.arguments[0]
            if (configObject && configObject.type === 'ObjectExpression') {
              let pluginsProperty = configObject.properties.find(
                p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'plugins',
              ) as recast.types.namedTypes.Property | undefined

              if (pluginsProperty) {
                if (pluginsProperty.value && pluginsProperty.value.type === 'ArrayExpression') {
                  pluginsProperty.value.elements.push(pluginNode)
                  pluginAdded = true
                }
              }
              else {
                const newProperty = recast.parse('({ plugins: [] })', { parser: typescriptParser }).program.body[0]
                if (newProperty?.type === 'ExpressionStatement'
                  && newProperty.expression?.type === 'ObjectExpression') {
                  pluginsProperty = newProperty.expression.properties[0]
                  if (pluginsProperty?.value?.type === 'ArrayExpression') {
                    pluginsProperty.value.elements.push(pluginNode)
                  }
                  configObject.properties.push(pluginsProperty!)
                  pluginAdded = true
                }
              }
            }
            return false
          }
          this.traverse(path)
          return false
        },
      })

      if (!pluginAdded) {
        console.warn('Warning: Could not find a `defineConfig` call to add the plugin to.')
      }

      return this
    }
  }
}
