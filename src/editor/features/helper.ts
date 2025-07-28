import type { Config, ReactProjectConfig, VueProjectConfig } from '@/types'
import { createVueFileEditor } from '..'

type PC = ReactProjectConfig | VueProjectConfig

export function createAndEditVueFile(code: string, config: Config & PC) {
  const editor = createVueFileEditor(code)
  if (config.language === 'typescript') {
    editor.setScriptLang('ts')
  }
  if (config.cssPreprocessor && config.cssPreprocessor !== 'none') {
    editor.setStyleLang(config.cssPreprocessor as 'scss' | 'less')
  }
  return editor.getSource()
}
