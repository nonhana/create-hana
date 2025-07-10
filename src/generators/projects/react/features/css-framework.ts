import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateCssFramework(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  switch (config.cssFramework) {
    case 'tailwindcss': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.tailwindcss = '^4.1.11'
      if (config.buildTool === 'vite') {
        packageJson.devDependencies['@tailwindcss/vite'] = '^4.1.11'
        context.files['src/styles/global.css'] = `@import "tailwindcss";`
        context.viteConfigEditor!.addImport('viteConfig', `import tailwindcss from '@tailwindcss/vite'`)
        context.viteConfigEditor!.addVitePlugin(`tailwindcss()`)
        context.mainEditor!.addImport('main', `import './styles/global.css'`)
      }
      break
    }
    case 'unocss': {
      packageJson.devDependencies = packageJson.devDependencies || {}
      packageJson.devDependencies.unocss = '^66.3.3'
      if (config.buildTool === 'vite') {
        context.files['uno.config.ts'] = generateUnoCssConfig()
        context.viteConfigEditor!.addImport('viteConfig', `import UnoCSS from 'unocss/vite'`)
        context.viteConfigEditor!.addVitePlugin(`UnoCSS()`)
        context.mainEditor!.addImport('main', `import 'virtual:uno.css'`)
      }
      break
    }
  }
}

function generateUnoCssConfig() {
  return `import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    /* Core Presets */
    presetWind3(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
`
}
