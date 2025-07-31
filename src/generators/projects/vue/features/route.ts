import type { ProjectContext, VueConfig } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateRoutingLibrary(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (!config.useRouter)
    return

  const alias
  = config.modulePathAliasing && config.modulePathAliasing !== 'none'
    ? config.modulePathAliasing
    : '..'

  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies['vue-router'] = '^4.5.0'

  context.files[`src/router/index${context.fileExtension}`] = generateRouterIndex(alias)

  context.files['src/views/Home.vue'] = generateHomePage(config, alias)
  context.files['src/views/About.vue'] = generateAboutPage(config)
}

function generateRouterIndex(pathAlias: string) {
  return `import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('${pathAlias}/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('${pathAlias}/views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
`
}

function generateHomePage(vueConfig: VueConfig, pathAlias: string) {
  const styleScope = `<style scoped${vueConfig.cssPreprocessor !== 'none' ? ` lang="${vueConfig.cssPreprocessor}"` : ''}>
.home {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
}

a {
  color: #42b983;
  text-decoration: none;
  margin: 1rem;
  display: inline-block;
}

a:hover {
  text-decoration: underline;
}
</style>
  `
  if (vueConfig.usePinia) {
    return `<script setup${vueConfig.language === 'typescript' ? ' lang="ts"' : ''}>
import Counter from '${pathAlias}/components/Counter.vue'
</script>

<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>This is the home page with Pinia state management demo.</p>
    <router-link to="/about">Go to About</router-link>
    
    <Counter />
  </div>
</template>

${styleScope}
`
  }

  return `<script setup${vueConfig.language === 'typescript' ? ' lang="ts"' : ''}>
// Home page logic here
</script>

<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>This is the home page.</p>
    <router-link to="/about">Go to About</router-link>
  </div>
</template>

${styleScope}
`
}

function generateAboutPage(vueConfig: VueConfig) {
  return `<script setup${vueConfig.language === 'typescript' ? ' lang="ts"' : ''}>
// About page logic here
</script>

<template>
  <div class="about">
    <h1>About Page</h1>
    <p>This is the about page.</p>
    <router-link to="/">Back to Home</router-link>
  </div>
</template>

<style scoped${vueConfig.cssPreprocessor !== 'none' ? ` lang="${vueConfig.cssPreprocessor}"` : ''}>
.about {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: #2c3e50;
}

a {
  color: #42b983;
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
}

a:hover {
  text-decoration: underline;
}
</style>
`
}
