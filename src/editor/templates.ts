export function viteTemplate() {
  return `import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
})
`
}

export function mainReactTemplate(fileExtension: '.js' | '.ts') {
  return `import { createRoot } from 'react-dom/client'
import App from './App${fileExtension}x'

createRoot(document.getElementById('root')!).render(<App />)
`
}

export function mainRouterProviderTemplate(routingLibrary: string) {
  return `import { createRoot } from 'react-dom/client'
import { RouterProvider } from '${routingLibrary}'
import router from './router'

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
`
}

export function mainVueTemplate() {
  return `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`
}
