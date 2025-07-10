import type { ProjectContext } from '@/types'
import { ErrorMessages } from '@/constants/errors'
import { ErrorFactory } from '@/error/factory'

export function generateRoutingLibrary(context: ProjectContext) {
  const { config, packageJson } = context
  if (config.projectType !== 'react')
    throw ErrorFactory.validation(ErrorMessages.validation.invalidProjectType(config.projectType))

  const alias = config.modulePathAliasing && config.modulePathAliasing !== 'none' ? config.modulePathAliasing : '..'

  packageJson.dependencies = packageJson.dependencies || {}

  context.files[`src/pages/home${context.fileExtension}x`] = generateDefaultPage()

  switch (config.routingLibrary) {
    case 'react-router': {
      packageJson.dependencies['react-router'] = '^7.6.3'
      context.files[`src/router/index${context.fileExtension}x`] = generateReactRouterIndex(alias)
      break
    }
    case 'tanstack-router': {
      packageJson.dependencies['@tanstack/react-router'] = '^1.125.6'
      context.files[`src/router/index${context.fileExtension}x`] = generateTanstackRouterIndex(alias)
      break
    }
    case 'wouter': {
      packageJson.dependencies.wouter = '^3.7.1'
      break
    }
  }
}

function generateDefaultPage() {
  return `export default function Home() {
    return <div>This is default page</div>
  }
  `
}

function generateReactRouterIndex(pathAlias: string) {
  return `import { createBrowserRouter } from "react-router"

const router = createBrowserRouter([
  {
    path: "/",
    element: () => import('${pathAlias}/pages/home'),
  }
])

export default router
`
}

function generateTanstackRouterIndex(pathAlias: string) {
  return `import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { Home } from '${pathAlias}/pages/home'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
})

export const routeTree = rootRoute.addChildren([homeRoute])

const router = createRouter({ routeTree })

export default router
`
}
