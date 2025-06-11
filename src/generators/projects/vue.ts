import type { Generator, ProjectContext } from '@/types'
import { addViteScripts, addVueDependencies, createVueTemplateFactory, generateVueGitignore, generateVueReadmeTemplate } from '@/templates/vue'

export const vueGenerator: Generator = {
  generate(context) {
    const { config } = context
    const projectName = config.targetDir || 'hana-vue-project'

    generateBaseFiles(context, projectName)

    setupPackageJson(context, projectName)

    createVueTemplateFactory(context).generate()

    addVueDependencies(context)
    addViteScripts(context)

    // TODO: 根据配置添加功能(router,pinia,css)

    // TODO: 针对 eslint等进行针对配置
  },
}

function setupPackageJson(context: ProjectContext, projectName: string) {
  Object.assign(context.packageJson, {
    name: projectName,
    description: 'A Vue.js application',
    version: '1.0.0',
    type: 'module',
    license: 'MIT',
    engines: {
      node: '>=18.0.0',
    },
  })
}

function generateBaseFiles(context: ProjectContext, projectName: string) {
  context.files['README.md'] = generateVueReadmeTemplate(projectName, 'A Vue.js application with Vite')
  context.files['.gitignore'] = generateVueGitignore()
}
