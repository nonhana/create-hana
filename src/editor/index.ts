import { CoreEditor } from './core-editor'
import { withCommonFeature } from './features/common'
import { withJsxProviderFeature } from './features/jsx-provider'
import { withViteFeature } from './features/vite'
import { withVueAppChainFeature } from './features/vue-app-chain'

export const ViteConfigEditor = withViteFeature(withCommonFeature(CoreEditor))
export const ReactMainEditor = withJsxProviderFeature(withCommonFeature(CoreEditor))
export const VueMainEditor = withVueAppChainFeature(withCommonFeature(CoreEditor))

export function createViteConfigEditor(code: string) {
  return new ViteConfigEditor({ viteConfig: code })
}
export function createReactMainEditor(code: string) {
  return new ReactMainEditor({ main: code })
}
export function createVueMainEditor() {
  return new VueMainEditor({ main: '' })
}

export type ViteConfigEditorType = InstanceType<typeof ViteConfigEditor>
export type ReactMainEditorType = InstanceType<typeof ReactMainEditor>
export type VueMainEditorType = InstanceType<typeof VueMainEditor>
