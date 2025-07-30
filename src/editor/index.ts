import { CoreEditor } from './core-editor'
import { withCommonFeature } from './features/common'
import { withJsxProviderFeature } from './features/jsx-provider'
import { withViteFeature } from './features/vite'
import { withVueAppChainFeature } from './features/vue-app-chain'
import { withVueScriptFeature } from './features/vue-script'
import { withVueStyleFeature } from './features/vue-style'
import { VueSFCEditor } from './vue-sfc-editor'

export const ViteConfigEditor = withViteFeature(withCommonFeature(CoreEditor))
export const ReactMainEditor = withJsxProviderFeature(withCommonFeature(CoreEditor))
export const VueMainEditor = withVueAppChainFeature(withCommonFeature(CoreEditor))
export const VueFileEditor = withVueStyleFeature(withVueScriptFeature(VueSFCEditor))

export function createViteConfigEditor(code: string) {
  return new ViteConfigEditor({ viteConfig: code })
}
export function createReactMainEditor(code: string) {
  return new ReactMainEditor({ main: code })
}
export function createVueMainEditor() {
  return new VueMainEditor({ main: '' })
}
export function createVueFileEditor(code: string) {
  return new VueFileEditor(code)
}
