import type { VueSFCEditor } from '../vue-sfc-editor'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IVueScriptFeature {
  addScriptAttribute: (attribute: string, value?: string) => this
  setScriptLang: (lang: 'ts' | 'js') => this
}

export function withVueScriptFeature<T extends new (...args: any[]) => VueSFCEditor>(Base: T) {
  return class extends Base implements IVueScriptFeature {
    addScriptAttribute(attribute: string, value?: string): this {
      const block = this.getBlock('script')
      if (!block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<script>'))
      if (block.attrs[attribute] !== undefined)
        return this
      const newAttrs: Record<string, string | boolean> = { ...block.attrs, [attribute]: value ?? true }
      this.updateBlockAttrs('script', newAttrs)
      return this
    }

    setScriptLang(lang: 'ts' | 'js'): this {
      const block = this.getBlock('script')
      if (!block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<script>'))
      const newAttrs: Record<string, string | boolean> = { ...block.attrs }
      if (lang === 'ts')
        newAttrs.lang = 'ts'
      else delete newAttrs.lang
      this.updateBlockAttrs('script', newAttrs)
      return this
    }
  }
}
