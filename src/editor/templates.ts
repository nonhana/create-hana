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

export function mainReactRouterProviderTemplate(routingLibrary: string) {
  return `import { createRoot } from 'react-dom/client'
import { RouterProvider } from '${routingLibrary}'
import router from './router'

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)
`
}

export function mainVueTemplate(useRouter?: boolean, usePinia?: boolean) {
  const imports = ['import { createApp } from \'vue\'', 'import App from \'./App.vue\'']
  let appChain = 'createApp(App)'

  if (useRouter) {
    imports.push('import router from \'./router\'')
    appChain += '.use(router)'
  }

  if (usePinia) {
    imports.push('import { createPinia } from \'pinia\'')
    appChain += '.use(createPinia())'
  }

  appChain += '.mount(\'#app\')'

  return `${imports.join('\n')}

${appChain}
`
}
