import type { Generator } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { createVueFileEditor } from '@/editor'
import { createAndEditVueFile } from '@/editor/features/helper'
import { ErrorFactory } from '@/error/factory'
import { generateAlias } from '@/generators/projects/common/alias'
import { generateCssFramework } from '@/generators/projects/common/css-framework'
import { generateCssPreprocessor } from '@/generators/projects/common/css-preprocessor'
import { generateHttpLibrary } from '@/generators/projects/common/http'
import { addDependencies } from '@/utils/package-json'
import { generateGitignore, generateHanaLogo, generateReadmeTemplate, generateSPAHtmlTemplate, generateViteEnvFile } from '@/utils/template'
import { generateRoutingLibrary } from './features/route'
import { generateStateManagement } from './features/state-management'

export const vueGenerator: Generator = {
  generate(context) {
    const { config, fileExtension, packageJson } = context
    if (!config.projectType)
      throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
    if (config.projectType !== 'vue')
      throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

    const projectName = config.targetDir || 'hana-project'

    addDependencies(packageJson, {
      vue: '^3.5.18',
    })

    if (config.buildTool === 'vite') {
      addDependencies(packageJson, { '@vitejs/plugin-vue': '^6.0.0' }, 'devDependencies')
      context.viteConfigEditor!.addImport('viteConfig', `import vue from '@vitejs/plugin-vue'`)
      context.viteConfigEditor!.addVitePlugin(`vue()`)
    }

    // 1. Generate src directory structure and files
    const appFileName = 'src/App.vue'

    // App.vue
    const appFileContent = config.useRouter
      ? generateAppFileWithRouter()
      : generateAppFile()

    // Counter.vue
    const counterFileName = 'src/components/Counter.vue'
    const counterFileContent = generateCounterFile()

    // 2. Generate root files
    context.files['public/favicon.svg'] = generateHanaLogo()

    context.files['index.html'] = generateSPAHtmlTemplate({
      title: 'vue project',
      bodyId: 'app',
      mainScriptPath: `/src/main${fileExtension}`,
    })

    // 3. Edit .vue files
    context.files[appFileName] = createAndEditVueFile(appFileContent, config)
    context.files[counterFileName] = createAndEditVueFile(counterFileContent, config)

    if (config.language === 'typescript') {
      context.files['src/vite-env.d.ts'] = generateViteEnvFile()
    }

    context.files['README.md'] = generateReadmeTemplate(
      config.projectType,
      projectName,
      'A Vue project',
    )

    context.files['.gitignore'] = generateGitignore()

    // 4. Modify package.json
    context.packageJson.name = projectName
    context.packageJson.description = 'A Vue project'
    context.packageJson.version = '1.0.0'
    context.packageJson.license = 'MIT'
    context.packageJson.engines = {
      node: '>=18.12.0', // V18 LTS
    }

    // 5. Features
    if (config.cssFramework && config.cssFramework !== 'none') {
      generateCssFramework(context)
    }
    if (config.cssPreprocessor && config.cssPreprocessor !== 'none') {
      generateCssPreprocessor(context)
    }
    if (config.useRouter) {
      generateRoutingLibrary(context)
    }
    if (config.usePinia) {
      generateStateManagement(context)
    }
    if (config.httpLibrary && config.httpLibrary !== 'none') {
      generateHttpLibrary(context)
    }
    if (config.modulePathAliasing && config.modulePathAliasing !== 'none') {
      generateAlias(context)
    }
  },
}

/* File generators */

function generateAppFile() {
  return `<script setup>
import Counter from './components/Counter.vue'
</script>

<template>
  <div>
    <h1>Hello, vite + vue</h1>
    <Counter />
  </div>
</template>

<style>
/* Add your global styles here */
</style>
`
}

function generateAppFileWithRouter() {
  return `<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>

<style>
/* Add your global styles here */
</style>
`
}

function generateCounterFile() {
  return `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <button type="button" @click="count++">+</button>
    <button type="button" @click="count--">-</button>
  </div>
</template>

<style scoped>
div {
  text-align: center;
  padding: 2rem;
}

button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #f0f0f0;
}
</style>
`
}
