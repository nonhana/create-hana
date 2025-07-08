export function viteTemplate() {
  return `import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
})
`
}

export function mainReactTemplate(fileExtension: string) {
  return `import { createRoot } from 'react-dom/client'
import App from './App${fileExtension}x'

createRoot(document.getElementById('root')!).render(<App />)
`
}

export function mainVueTemplate() {
  return `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`
}
