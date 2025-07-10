import type { CoreEditor } from '../core-editor'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { parser } from '@/utils/parser'

export interface IViteFeature {
  addVitePlugin: (pluginCode: string) => this
  // { '@': 'path.resolve(__dirname, "src")' }
  addViteAlias: (aliasRecord: Record<string, string>) => this
}

export function withViteFeature<T extends new (...args: any[]) => CoreEditor>(Base: T) {
  return class extends Base implements IViteFeature {
    addVitePlugin(pluginCode: string): this {
      if (!this.contents.viteConfig)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('viteConfig'))

      const ast = this.contents.viteConfig.ast

      const pluginAst = recast.parse(pluginCode, { parser }).program.body[0]
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
                p => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key.type === 'Identifier' && p.key.name === 'plugins',
              ) as recast.types.namedTypes.Property | undefined

              if (pluginsProperty && pluginsProperty.value && pluginsProperty.value.type === 'ArrayExpression') {
                // 向现有的 plugins 数组添加插件
                pluginsProperty.value.elements.push(pluginNode)
                pluginAdded = true
              }
              else if (!pluginsProperty) {
                // 如果没有 plugins 属性，创建一个新的
                const newProperty = recast.parse('({ plugins: [] })', { parser }).program.body[0]
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

      // 更新源代码和 AST
      this.contents.viteConfig.source = recast.print(ast).code
      this.contents.viteConfig.ast = recast.parse(this.contents.viteConfig.source, { parser })

      return this
    }

    addViteAlias(aliasRecord: Record<string, string>): this {
      if (!this.contents.viteConfig)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('viteConfig'))

      const ast = this.contents.viteConfig.ast

      let aliasAdded = false

      recast.visit(ast, {
        visitCallExpression(path) {
          const { node } = path
          if (node.callee.type === 'Identifier' && node.callee.name === 'defineConfig') {
            const configObject = node.arguments[0]
            if (configObject && configObject.type === 'ObjectExpression') {
              // 查找 resolve 属性
              let resolveProperty = configObject.properties.find(
                p => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key.type === 'Identifier' && p.key.name === 'resolve',
              ) as recast.types.namedTypes.Property | undefined

              if (!resolveProperty) {
                // 创建 resolve 属性
                const newResolveProperty = recast.parse('({ resolve: {} })', { parser }).program.body[0]
                if (newResolveProperty?.type === 'ExpressionStatement'
                  && newResolveProperty.expression?.type === 'ObjectExpression') {
                  resolveProperty = newResolveProperty.expression.properties[0] as recast.types.namedTypes.Property
                  configObject.properties.push(resolveProperty!)
                }
              }

              if (resolveProperty && resolveProperty.value && resolveProperty.value.type === 'ObjectExpression') {
                // 查找 alias 属性
                let aliasProperty = resolveProperty.value.properties.find(
                  p => (p.type === 'Property' || p.type === 'ObjectProperty') && p.key.type === 'Identifier' && p.key.name === 'alias',
                ) as recast.types.namedTypes.Property | undefined

                if (!aliasProperty) {
                  // 创建 alias 属性
                  const newAliasProperty = recast.parse('({ alias: {} })', { parser }).program.body[0]
                  if (newAliasProperty?.type === 'ExpressionStatement'
                    && newAliasProperty.expression?.type === 'ObjectExpression') {
                    aliasProperty = newAliasProperty.expression.properties[0] as recast.types.namedTypes.Property
                    resolveProperty.value.properties.push(aliasProperty!)
                  }
                }

                if (aliasProperty && aliasProperty.value && aliasProperty.value.type === 'ObjectExpression') {
                  // 添加新的 alias 条目
                  for (const [key, value] of Object.entries(aliasRecord)) {
                    // 检查是否已存在该 key
                    const existingProperty = aliasProperty.value.properties.find(
                      p => (p.type === 'Property' || p.type === 'ObjectProperty')
                        && (((p.key.type === 'Literal' || p.key.type === 'StringLiteral') && p.key.value === key)
                          || (p.key.type === 'Identifier' && p.key.name === key)),
                    )

                    if (!existingProperty) {
                      try {
                        // 解析 value 字符串为 AST 节点
                        let valueNode: any

                        // 如果值已经是字符串字面量（以引号包围），直接创建字符串字面量节点
                        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
                          valueNode = {
                            type: 'Literal',
                            value: value.slice(1, -1), // 移除引号
                            raw: value,
                          }
                        }
                        else {
                          // 否则解析为表达式
                          const valueAst = recast.parse(value, { parser }).program.body[0]
                          if (valueAst?.type === 'ExpressionStatement') {
                            valueNode = valueAst.expression
                          }
                          else {
                            throw new Error('Unable to parse value as expression')
                          }
                        }

                        const newProperty: recast.types.namedTypes.Property = {
                          type: 'Property',
                          key: { type: 'Literal', value: key },
                          value: valueNode,
                          kind: 'init',
                          method: false,
                          shorthand: false,
                          computed: false,
                        }
                        aliasProperty.value.properties.push(newProperty)
                        aliasAdded = true
                      }
                      catch (error) {
                        console.warn(`Warning: Could not parse alias value for ${key}:`, error)
                      }
                    }
                  }
                }
              }
            }
            return false
          }
          this.traverse(path)
          return false
        },
      })

      if (!aliasAdded) {
        console.warn('Warning: Could not find a `defineConfig` call to add the alias to.')
      }

      // 更新源代码和 AST
      this.contents.viteConfig.source = recast.print(ast).code
      this.contents.viteConfig.ast = recast.parse(this.contents.viteConfig.source, { parser })

      return this
    }
  }
}
