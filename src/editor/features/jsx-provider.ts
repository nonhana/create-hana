import type { CoreEditor } from '../core-editor'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IJsxProviderFeature {
  addJsxProvider: (componentName: string, props?: Record<string, string>) => this
}

export function withJsxProviderFeature<T extends new (...args: any[]) => CoreEditor>(Base: T) {
  return class extends Base implements IJsxProviderFeature {
    addJsxProvider(componentName: string, props: Record<string, string> = {}): this {
      if (!this.contents.main)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('main'))

      const ast = this.contents.main.ast

      recast.visit(ast, {
        visitCallExpression(path: any) {
          const { node } = path

          if (node.callee.type === 'MemberExpression'
            && node.callee.property.type === 'Identifier'
            && node.callee.property.name === 'render') {
            if (node.arguments.length > 0) {
              const currentElement = node.arguments[0]

              if (currentElement) {
                const { builders } = recast.types

                const attributes: any[] = []
                Object.entries(props).forEach(([key, value]) => {
                  const jsxAttribute = builders.jsxAttribute(
                    builders.jsxIdentifier(key),
                    builders.jsxExpressionContainer(builders.identifier(value)),
                  )
                  attributes.push(jsxAttribute)
                })

                const openingElement = builders.jsxOpeningElement(
                  builders.jsxIdentifier(componentName),
                  attributes,
                )

                const closingElement = builders.jsxClosingElement(
                  builders.jsxIdentifier(componentName),
                )

                const newJsxElement = builders.jsxElement(
                  openingElement,
                  closingElement,
                  [currentElement],
                )

                node.arguments[0] = newJsxElement
              }
            }

            return false
          }

          this.traverse(path)
          return false
        },
      })

      if (this.contents.main) {
        this.contents.main.source = recast.print(this.contents.main.ast).code
      }

      return this
    }
  }
}
