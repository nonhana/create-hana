import type { ProjectContext } from '@/types'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

// Add import sentence to the top of the code
export function addViteImport(context: ProjectContext, importCode: string) {
  if (!context.viteConfigCode)
    throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('viteConfigCode'))

  const ast = recast.parse(context.viteConfigCode)
  recast.visit(ast, {
    visitProgram(path) {
      const importDeclaration = recast.parse(`${importCode}\n`).program.body[0]
      path.node.body.unshift(importDeclaration)
      return false
    },
  })
  return recast.print(ast).code
}

// Add plugin to the vite config
export function addVitePlugin(context: ProjectContext, pluginCode: string): string {
  if (!context.viteConfigCode)
    throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('viteConfigCode'))
  const ast = recast.parse(context.viteConfigCode)

  const pluginAst = recast.parse(pluginCode).program.body[0]
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
            const newProperty = recast.parse('({ plugins: [] })').program.body[0]
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

  return recast.print(ast, { tabWidth: 2, quote: 'single' }).code
}
