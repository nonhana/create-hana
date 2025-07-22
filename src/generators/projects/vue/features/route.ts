import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateRoutingLibrary(context: ProjectContext) {
  const { config, packageJson } = context
  if (!config.projectType)
    throw ErrorFactory.validation(ErrorMessages.validation.projectTypeRequired())
  if (config.projectType !== 'vue')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  if (!config.useRouter) {
    return
  }
  const alias
  = config.modulePathAliasing && config.modulePathAliasing !== 'none'
    ? config.modulePathAliasing
    : '..'

  const fileExtension = context.fileExtension || '.ts'

  packageJson.dependencies = packageJson.dependencies || {}
  packageJson.dependencies['vue-router'] = '^4.5.0'

  context.files[`src/router/index${fileExtension}`] = generateRouterIndex(alias)

  context.files['src/views/Home.vue'] = generateHomePage(config.usePinia, config.language, config.cssPreprocessor)
  context.files['src/views/About.vue'] = generateAboutPage(config.language, config.cssPreprocessor)
}

function generateRouterIndex(pathAlias: string) {
  return `import { createRouter, createWebHistory } from 'vue-router'
import Home from '${pathAlias}/views/Home.vue'
import About from '${pathAlias}/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
`
}

function generateHomePage(usePinia?: boolean, language?: 'typescript' | 'javascript', cssPreprocessor?: 'none' | 'less' | 'scss') {
  const styleAttr = cssPreprocessor && cssPreprocessor !== 'none' ? ` lang="${cssPreprocessor}"` : ''

  if (usePinia) {
    return `<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>This is the home page with Pinia state management demo.</p>
    <router-link to="/about">Go to About</router-link>
    
    <CounterExample />
  </div>
</template>

<script setup${language === 'typescript' ? ' lang="ts"' : ''}>
import CounterExample from '../components/CounterExample.vue'
</script>

<style scoped${styleAttr}>
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
  }

  return `<template>
  <div class="home">
    <h1>Welcome to Home Page</h1>
    <p>This is the home page.</p>
    <router-link to="/about">Go to About</router-link>
  </div>
</template>

<script setup${language === 'typescript' ? ' lang="ts"' : ''}>
// Home page logic here
</script>

<style scoped${styleAttr}>
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
  margin-top: 1rem;
  display: inline-block;
}

a:hover {
  text-decoration: underline;
}
</style>
`
}

function generateAboutPage(language?: 'typescript' | 'javascript', cssPreprocessor?: 'none' | 'less' | 'scss') {
  const styleAttr = cssPreprocessor && cssPreprocessor !== 'none' ? ` lang="${cssPreprocessor}"` : ''

  return `<template>
  <div class="about">
    <h1>About Page</h1>
    <p>This is the about page.</p>
    <router-link to="/">Back to Home</router-link>
  </div>
</template>

<script setup${language === 'typescript' ? ' lang="ts"' : ''}>
// About page logic here
</script>

<style scoped${styleAttr}>
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
