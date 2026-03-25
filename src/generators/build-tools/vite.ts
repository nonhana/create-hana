import type { Generator } from '@/types'
import { addDependencyPreset, addScripts } from '@/utils/package-json'

export const viteGenerator: Generator = {
  generate(context) {
    addDependencyPreset(context.packageJson, 'build.vite.base')

    addScripts(context.packageJson, {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    })
  },
}
