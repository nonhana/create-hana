import type { SFCScriptBlock } from '@vue/compiler-sfc'
import type { VueSFCEditor } from '../vue-sfc-editor'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IVueScriptFeature {
  addScriptAttribute: (attribute: string, value?: string) => this
  setScriptLang: (lang: 'ts' | 'js') => this
}

export function withVueScriptFeature<T extends new (...args: any[]) => VueSFCEditor>(Base: T) {
  return class extends Base implements IVueScriptFeature {
    constructor(...args: any[]) {
      super(...args)
      this.block = this.getBlock('script')
    }

    block: SFCScriptBlock | undefined
    addScriptAttribute(attribute: string, value?: string): this {
      if (!this.block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<script>'))
      if (this.block.attrs[attribute] !== undefined)
        return this
      const newAttrs: Record<string, string | boolean> = { ...this.block.attrs, [attribute]: value ?? true }
      this.updateBlockAttrs('script', newAttrs)
      return this
    }

    setScriptLang(lang: 'ts' | 'js'): this {
      if (!this.block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<script>'))
      const newAttrs: Record<string, string | boolean> = { ...this.block.attrs }
      if (lang === 'ts')
        newAttrs.lang = 'ts'
      else delete newAttrs.lang
      this.updateBlockAttrs('script', newAttrs)
      return this
    }
  }
}
