import type { SFCScriptBlock, SFCStyleBlock } from '@vue/compiler-sfc'
import { parse as parseVueSFC } from '@vue/compiler-sfc'

export class VueSFCEditor {
  public source: string
  public descriptor: ReturnType<typeof parseVueSFC>['descriptor']

  constructor(source: string) {
    this.source = source
    this.descriptor = parseVueSFC(source, { filename: 'component.vue' }).descriptor
  }

  updateSource(newSource: string) {
    this.source = newSource
    this.descriptor = parseVueSFC(newSource, { filename: 'component.vue' }).descriptor
  }

  getBlock(type: 'style', index?: number): SFCStyleBlock | undefined
  getBlock(type: 'script'): SFCScriptBlock | undefined
  getBlock(type: 'style' | 'script', index = 0): SFCStyleBlock | SFCScriptBlock | undefined {
    if (type === 'style')
      return this.descriptor.styles[index]
    if (type === 'script')
    // 很重要，<script> 和 <script setup> 在不同的位置
      return this.descriptor.script ?? this.descriptor.scriptSetup ?? undefined
    return undefined
  }

  updateBlockAttrs(type: 'style', attrs: Record<string, string | boolean>, index?: number): void
  updateBlockAttrs(type: 'script', attrs: Record<string, string | boolean>): void
  updateBlockAttrs(type: 'style' | 'script', attrs: Record<string, string | boolean>, index = 0): void {
    if (type === 'style') {
      const newTag = this.buildTag('style', attrs)
      const newSource = this.replaceBlockTag('style', index, newTag)
      this.updateSource(newSource)
    }
    else if (type === 'script') {
      const block = this.getBlock('script') as SFCScriptBlock | undefined
      const setup = block?.setup
      const newTag = this.buildTag('script', attrs, setup)
      const newSource = this.replaceBlockTag('script', 0, newTag)
      this.updateSource(newSource)
    }
  }

  buildTag(type: 'style', attrs: Record<string, string | boolean>): string
  buildTag(type: 'script', attrs: Record<string, string | boolean>, setup?: boolean | string): string
  buildTag(type: 'style' | 'script', attrs: Record<string, string | boolean>, setup?: boolean | string): string {
    const attrStrings: string[] = []
    if (type === 'script' && setup && !attrs.setup) {
      attrStrings.push('setup')
    }
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'setup') {
        if (value)
          attrStrings.push('setup')
      }
      else if (value === true) {
        attrStrings.push(key)
      }
      else {
        attrStrings.push(`${key}="${value}"`)
      }
    }
    const attrString = attrStrings.length > 0 ? ` ${attrStrings.join(' ')}` : ''
    return `<${type}${attrString}>`
  }

  replaceBlockTag(type: 'style' | 'script', index: number, newTag: string): string {
    const regex = type === 'style' ? /<style[^>]*>/g : /<script[^>]*>/
    let matchCount = 0
    return this.source.replace(regex, (match) => {
      if (matchCount === index) {
        matchCount++
        return newTag
      }
      matchCount++
      return match
    })
  }

  getSource(): string {
    return this.source
  }
}
