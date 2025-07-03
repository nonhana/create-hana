import type { Config, Generator } from '@/types'
import * as recast from 'recast'
import { viteTemplate } from '@/templates/vite'
import { addDependencies, addScripts } from '@/utils/package-json'

export const viteGenerator: Generator = {
  generate(context) {
    const { config } = context

    addDependencies(context.packageJson, {
      vite: '^7.0.0',
    })

    addScripts(context.packageJson, {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    })

    const viteConfig = generateViteConfig(config)
    context.files['vite.config.ts'] = viteConfig
  },
}

function generateViteConfig(config: Config) {
  const ast = recast.parse(viteTemplate)

  let result = ''

  switch (config.projectType) {
    case 'react':
      recast.visit(ast, {
        visitProgram(path) {
          const importDeclaration = recast.parse(`import react from '@vitejs/plugin-react'\n`).program.body[0]
          path.node.body.unshift(importDeclaration)
          return false
        },
      })
      result = recast.print(ast).code
      break
  }

  return result
}
