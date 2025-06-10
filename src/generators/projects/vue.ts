import type { Generator, ProjectContext } from '@/types'
import { addDependencies } from '@/utils/package-json'
import { addViteScripts, addVueDependencies, generateAppFile, generateCssFile, generateHelloWorldComponent, generateIndexHtml, generateMainFile, generateTypeScriptConfig, generateViteConfig, generateVueGitignore, generateVueReadmeTemplate } from '@/utils/vue/vue-template'

export const vueGenerator: Generator = {
  generate(context) {
    const { config } = context
    const projectName = config.targetDir || 'hana-vue-project'

    // 通用文件
    context.files['README.md'] = generateVueReadmeTemplate(projectName, 'A Vue.js application with Vite')
    context.files['.gitignore'] = generateVueGitignore()

    // package.json
    context.packageJson.name = projectName
    context.packageJson.description = 'A Vue.js application'
    context.packageJson.version = '1.0.0'
    context.packageJson.type = 'module'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=18.0.0',
    }

    // 生成基础文件
    generateViteConfig(context)
    generateIndexHtml(context, projectName)
    generateMainFile(context)
    generateAppFile(context)
    generateHelloWorldComponent(context)
    generateCssFile(context)

    // 添加基础依赖
    addVueDependencies(context)

    // 添加脚本
    addViteScripts(context)

    if (context.config.language === 'typescript') {
      generateTypeScriptConfig(context)
    }

    // TODO: 根据配置添加功能

    // TODO: 针对 eslint等进行针对配置
  },
}
