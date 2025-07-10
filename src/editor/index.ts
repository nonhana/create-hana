import { CoreEditor } from './core-editor'
import { withCommonFeature } from './features/common'
import { withJsxProviderFeature } from './features/jsx-provider'
import { withViteFeature } from './features/vite'

export const ViteConfigEditor = withViteFeature(withCommonFeature(CoreEditor))
export const MainEditor = withJsxProviderFeature(withCommonFeature(CoreEditor))

export function createViteConfigEditor(code: string) {
  return new ViteConfigEditor({ viteConfig: code })
}
export function createMainEditor(code: string) {
  return new MainEditor({ main: code })
}
