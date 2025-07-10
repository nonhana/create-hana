import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const viteGenerator: Generator = {
  generate(context) {
    addDependencies(context.packageJson, {
      vite: '^7.0.0',
    })

    addScripts(context.packageJson, {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    })
  },
}
