import { CoreEditor } from './core-editor'
import { withImportFeature } from './features/import'
import { withViteFeature } from './features/vite'

export const ViteConfigEditor = withViteFeature(withImportFeature(CoreEditor))
export const MainEditor = withImportFeature(CoreEditor)

export function createViteConfigEditor(code: string) {
  return new ViteConfigEditor({ viteConfig: code })
}
export function createMainEditor(code: string) {
  return new MainEditor({ main: code })
}
