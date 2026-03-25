import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'
import { addDependencyPreset } from '@/utils/package-json'

export function generateCssFramework(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react' && config.projectType !== 'vue') {
    throw ErrorFactory.validation(
      ErrorMessages.validation.invalidProjectType(config.projectType!),
    )
  }

  switch (config.cssFramework) {
    case 'tailwindcss': {
      addDependencyPreset(packageJson, 'feature.css-framework.tailwind.base')
      if (config.buildTool === 'vite') {
        addDependencyPreset(packageJson, 'feature.css-framework.tailwind.vite')
        context.files['src/styles/global.css'] = `@import "tailwindcss";`
        context.viteConfigEditor!.addImport(
          'viteConfig',
          `import tailwindcss from '@tailwindcss/vite'`,
        )
        context.viteConfigEditor!.addVitePlugin(`tailwindcss()`)
        context.mainEditor!.addImport('main', `import './styles/global.css'`)
      }
      break
    }
    case 'unocss': {
      addDependencyPreset(packageJson, 'feature.css-framework.unocss.vite')
      if (config.buildTool === 'vite') {
        context.files['uno.config.ts'] = generateUnoCssConfig()
        context.viteConfigEditor!.addImport(
          'viteConfig',
          `import UnoCSS from 'unocss/vite'`,
        )
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
