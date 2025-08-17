import type { COMMON_PATH_ALIASING_OPTIONS } from '@/questions/options/common'
import type {
  HONO_AUTH_OPTIONS,
  HONO_DATABASE_OPTIONS,
  HONO_JSX_LIBRARIES_OPTIONS,
  HONO_MIDDLEWARE_OPTIONS,
  HONO_PURPOSE_OPTIONS,
  HONO_RUNTIME_OPTIONS,
  HONO_TEST_FRAMEWORKS_OPTIONS,
  HONO_VALIDATION_LIBRARIES_OPTIONS,
} from '@/questions/options/features/hono'
import type {
  NODE_BUNDLERS_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '@/questions/options/features/node'
import type {
  REACT_QUERY_OPTIONS,
  REACT_ROUTING_LIBRARIES_OPTIONS,
  REACT_STATE_MANAGEMENT_OPTIONS,
} from '@/questions/options/features/react'
import type { VUE_CODE_QUALITY_TOOLS_OPTIONS } from '@/questions/options/features/vue'
import type {
  FRONTEND_BUILD_TOOLS_OPTIONS,
  FRONTEND_CSS_FRAMEWORKS_OPTIONS,
  FRONTEND_CSS_PREPROCESSORS_OPTIONS,
  FRONTEND_HTTP_OPTIONS,
} from '@/questions/options/frontend'

export interface NodeProjectConfig {
  webserverPkgs?: typeof NODE_WEBSERVER_OPTIONS[number]['value']
  tsRuntimePkgs?: typeof NODE_TS_RUNTIME_OPTIONS[number]['value']
  preinstallPkgs?: string[]
  bundler?: typeof NODE_BUNDLERS_OPTIONS[number]['value']
}

export interface FrontendProjectConfig {
  cssFramework?: typeof FRONTEND_CSS_FRAMEWORKS_OPTIONS[number]['value']
  cssPreprocessor?: typeof FRONTEND_CSS_PREPROCESSORS_OPTIONS[number]['value']
  httpLibrary?: typeof FRONTEND_HTTP_OPTIONS[number]['value']
  modulePathAliasing?: typeof COMMON_PATH_ALIASING_OPTIONS[number]['value']
  buildTool?: typeof FRONTEND_BUILD_TOOLS_OPTIONS[number]['value']
}

export interface ReactProjectConfig extends FrontendProjectConfig {
  routingLibrary?: typeof REACT_ROUTING_LIBRARIES_OPTIONS[number]['value']
  stateManagement?: typeof REACT_STATE_MANAGEMENT_OPTIONS[number]['value']
  queryLibrary?: typeof REACT_QUERY_OPTIONS[number]['value']
}

export interface VueProjectConfig extends FrontendProjectConfig {
  // override common code quality tools options
  codeQualityTools?: typeof VUE_CODE_QUALITY_TOOLS_OPTIONS[number]['value']
  useRouter?: boolean
  usePinia?: boolean
}

export interface HonoProjectConfig {
  runtime?: typeof HONO_RUNTIME_OPTIONS[number]['value']
  purpose?: typeof HONO_PURPOSE_OPTIONS[number]['value']
  jsxLibrary?: typeof HONO_JSX_LIBRARIES_OPTIONS[number]['value']
  validationLibrary?: typeof HONO_VALIDATION_LIBRARIES_OPTIONS[number]['value']
  openapi?: boolean
  database?: typeof HONO_DATABASE_OPTIONS[number]['value']
  auth?: typeof HONO_AUTH_OPTIONS[number]['value']
  middlewares?: typeof HONO_MIDDLEWARE_OPTIONS[number]['value'][]
  modulePathAliasing?: typeof COMMON_PATH_ALIASING_OPTIONS[number]['value']
  testFramework?: typeof HONO_TEST_FRAMEWORKS_OPTIONS[number]['value']
}
