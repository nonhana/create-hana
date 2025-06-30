import type { Generator } from '@/types'
import { addDependencies, addScripts } from '@/utils/package-json'

export const viteGenerator: Generator = {
  generate(context) {
    const { config } = context

    const projectType = config.projectType!
    const language = config.language!

    addDependencies(context.packageJson, {
      vite: '^7.0.0',
    })

    addScripts(context.packageJson, {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    })

    const viteConfig = generateViteConfig(projectType, language)
    context.files['vite.config.ts'] = viteConfig
  },
}

function generateViteConfig(projectType: string, language: 'typescript' | 'javascript') {
  return `
import { defineConfig } from 'vite'
import ${language} from 'vite-plugin-${language}'

export default defineConfig({
  plugins: [${language}()],
})
`
}
