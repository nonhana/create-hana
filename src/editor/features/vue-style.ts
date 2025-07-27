import type { SFCStyleBlock } from '@vue/compiler-sfc'
import type { VueSFCEditor } from '../vue-sfc-editor'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export interface IVueStyleFeature {
  addStyleAttribute: (attribute: string, value?: string, styleIndex?: number) => this
  setStyleLang: (lang: 'scss' | 'less' | 'css', styleIndex?: number) => this
}

export function withVueStyleFeature<T extends new (...args: any[]) => VueSFCEditor>(Base: T) {
  return class extends Base implements IVueStyleFeature {
    constructor(...args: any[]) {
      super(...args)
      this.block = this.getBlock('style')
    }

    block: SFCStyleBlock | undefined
    addStyleAttribute(attribute: string, value?: string, styleIndex = 0): this {
      if (!this.block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<style>'))
      // 已经存在
      if (this.block.attrs[attribute] !== undefined)
        return this
      const newAttrs: Record<string, string | boolean> = { ...this.block.attrs, [attribute]: value ?? true }
      this.updateBlockAttrs('style', newAttrs, styleIndex)
      return this
    }

    setStyleLang(lang: 'scss' | 'less' | 'css', styleIndex = 0): this {
      if (!this.block)
        throw ErrorFactory.validation(ErrorMessages.validation.fieldNotFound('<style>'))
      const newAttrs: Record<string, string | boolean> = { ...this.block.attrs }
      if (lang === 'css')
        delete newAttrs.lang
      else newAttrs.lang = lang
      this.updateBlockAttrs('style', newAttrs, styleIndex)
      return this
    }
  }
}
