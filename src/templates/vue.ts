import type { ProjectContext } from '@/types'
import { addDependencies, addScripts } from '../utils/package-json'
import { TemplateFactory } from './template-factory'

// Vite配置模板
const ViteConfigTemplate = {
  id: 'vite-config',
  getFilePath: (context: ProjectContext) => {
    return `vite.config.${context.config.language === 'typescript' ? 'ts' : 'js'}`
  },
  initContent: () => {
    return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
})
`
  },
}

// Main文件模板
const MainFileTemplate = {
  id: 'main-file',
  getFilePath: (context: ProjectContext) => {
    return `src/main.${context.config.language === 'typescript' ? 'ts' : 'js'}`
  },
  initContent: () => {
    return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`
  },
}

// Index HTML模板
const IndexHtmlTemplate = {
  id: 'index-html',
  getFilePath: () => 'index.html',
  initContent: (context: ProjectContext) => {
    const projectName = context.config.targetDir || 'Vue App'
    const scriptExtension = context.config.language === 'typescript' ? 'ts' : 'js'
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${scriptExtension}"></script>
  </body>
</html>
`
  },
}

// 样式文件模板
const StyleCssTemplate = {
  id: 'style-css',
  getFilePath: () => 'src/style.css',
  initContent: () => {
    return `:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.card {
  padding: 2em;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
  },
}

// App.vue模板
const AppVueTemplate = {
  id: 'app-vue',
  getFilePath: () => 'src/App.vue',
  initContent: (context: ProjectContext) => {
    return `${context.config.language === 'typescript' ? '<script setup lang="ts">' : '<script setup>'}
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld msg="hello create hana!" />
</template>

<style scoped>
</style>
`
  },
}

// HelloWorld组件模板
const HelloWorldTemplate = {
  id: 'hello-world',
  getFilePath: () => 'src/components/HelloWorld.vue',
  initContent: (context: ProjectContext) => {
    return `${context.config.language === 'typescript' ? '<script setup lang="ts">' : '<script setup>'}
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
</style>
`
  },
}

// TypeScript主配置模板
const TsConfigTemplate = {
  id: 'tsconfig',
  getFilePath: (_context: ProjectContext) => 'tsconfig.json',
  initContent: (_context: ProjectContext) => {
    return `{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
`
  },
}

// TypeScript应用配置模板
const TsConfigAppTemplate = {
  id: 'tsconfig-app',
  getFilePath: () => 'tsconfig.app.json',
  initContent: () => {
    return `{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
`
  },
}

// TypeScript Node配置模板
const TsConfigNodeTemplate = {
  id: 'tsconfig-node',
  getFilePath: () => 'tsconfig.node.json',
  initContent: () => {
    return `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
`
  },
}

// Vite环境声明模板
const ViteEnvDtsTemplate = {
  id: 'vite-env-dts',
  getFilePath: () => 'src/vite-env.d.ts',
  initContent: () => {
    return `/// <reference types="vite/client" />
`
  },
}

// Vue模板工厂
export function createVueTemplateFactory(context: ProjectContext): TemplateFactory {
  const factory = new TemplateFactory(context)
    .register(ViteConfigTemplate)
    .register(MainFileTemplate)
    .register(IndexHtmlTemplate)
    .register(StyleCssTemplate)
    .register(AppVueTemplate)
    .register(HelloWorldTemplate)

  if (context.config.language === 'typescript') {
    factory
      .register(TsConfigTemplate)
      .register(TsConfigAppTemplate)
      .register(TsConfigNodeTemplate)
      .register(ViteEnvDtsTemplate)
  }

  return factory
}

export function generateVueReadmeTemplate(projectName: string, description?: string) {
  return `# ${projectName}

${description || 'A Vue.js project'}`
}

export function generateVueGitignore() {
  return `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

`
}

export function generateViteConfig(context: ProjectContext) {
  const fileName = `vite.config.${context.config.language === 'typescript' ? 'ts' : 'js'}`

  const configContent = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
})
`

  context.files[fileName] = configContent
}

export function generateIndexHtml(context: ProjectContext, projectName: string) {
  const htmlContent = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${context.config.language === 'typescript' ? 'ts' : 'js'}"></script>
  </body>
</html>
`

  context.files['index.html'] = htmlContent
}

export function generateMainFile(context: ProjectContext) {
  const { config } = context
  const isTypeScript = config.language === 'typescript'

  const mainContent = `
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

`

  context.files[`src/main.${isTypeScript ? 'ts' : 'js'}`] = mainContent
}

export function generateAppFile(context: ProjectContext) {
  const appContent = `
${context.config.language === 'typescript' ? '<script setup lang="ts">' : '<script setup>'}
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld msg="hello create hana!" />
</template>

<style scoped>
</style>
`

  context.files['src/App.vue'] = appContent
}

export function generateHelloWorldComponent(context: ProjectContext) {
  const componentContent = `
${context.config.language === 'typescript' ? '<script setup lang="ts">' : '<script setup>'}
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>
</template>

<style scoped>
</style>

`

  context.files['src/components/HelloWorld.vue'] = componentContent
}

export function generateCssFile(context: ProjectContext) {
  const cssContent = `
    :root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.card {
  padding: 2em;
}

#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
  context.files['src/style.css'] = cssContent
}

export function addVueDependencies(context: ProjectContext) {
  const { packageJson, config } = context

  // Vue 核心依赖
  addDependencies(packageJson, {
    vue: '^3.5.13',
  }, 'dependencies')

  // Vite 和构建相关依赖
  addDependencies(packageJson, {
    '@vitejs/plugin-vue': '^5.2.3',
    'vite': '^6.3.5',
  }, 'devDependencies')

  // TypeScript 支持
  if (config.language === 'typescript') {
    addDependencies(packageJson, {
      'typescript': '~5.8.3',
      'vue-tsc': '^2.2.8',
      '@vue/tsconfig': '^0.7.0',
    }, 'devDependencies')
  }
}

export function addViteScripts(context: ProjectContext) {
  const { packageJson, config } = context

  addScripts(packageJson, {
    dev: 'vite',
    build: config.language === 'typescript' ? 'vue-tsc -b && vite build' : 'vite build',
    preview: 'vite preview',
  })
}

export function generateTypeScriptConfig(context: ProjectContext) {
  const tsconfigContent = `
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

`

  const tsconfigAppContent = `
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
`

  const tsconfigNodeContent = `
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}

`
  const envDtsContent = `/// <reference types="vite/client" />
`

  context.files['tsconfig.json'] = tsconfigContent
  context.files['tsconfig.app.json'] = tsconfigAppContent
  context.files['tsconfig.node.json'] = tsconfigNodeContent
  context.files['src/vite-env.d.ts'] = envDtsContent
}
