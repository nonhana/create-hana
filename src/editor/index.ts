import { CoreEditor } from './core-editor'
import { withImportFeature } from './features/import'
import { withJsxProviderFeature } from './features/jsx-provider'
import { withViteFeature } from './features/vite'

export const ViteConfigEditor = withViteFeature(withImportFeature(CoreEditor))
export const MainEditor = withJsxProviderFeature(withImportFeature(CoreEditor))

export function createViteConfigEditor(code: string) {
  return new ViteConfigEditor({ viteConfig: code })
}
export function createMainEditor(code: string) {
  return new MainEditor({ main: code })
}
