import type { CoreEditor } from '../core-editor'
import type { ICommonFeature } from './common'
import * as recast from 'recast'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IVueAppChainFeature {
  configureVueApp: (options: {
    useRouter: boolean | undefined
    usePinia: boolean | undefined
  }) => this
}

export function withVueAppChainFeature<T extends new (...args: any[]) => CoreEditor & ICommonFeature>(Base: T) {
  return class extends Base implements IVueAppChainFeature {
    configureVueApp(options: {
      useRouter: boolean | undefined
      usePinia: boolean | undefined
    }): this {
      if (!this.contents.main)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('main'))

      const { useRouter, usePinia } = options

      this.addImport('main', 'import { createApp } from \'vue\'')
      this.addImport('main', 'import App from \'./App.vue\'')
      if (useRouter) {
        this.addImport('main', 'import router from \'./router\'')
      }
      if (usePinia) {
        this.addImport('main', 'import { createPinia } from \'pinia\'')
      }

      let chain = 'createApp(App)'
      if (usePinia)
        chain += '.use(createPinia())'
      if (useRouter)
        chain += '.use(router)'
      chain += '.mount(\'#app\')'

      this.addCode('main', chain)

      if (this.contents.main) {
        this.contents.main.source = recast.print(this.contents.main.ast).code
      }

      return this
    }
  }
}
