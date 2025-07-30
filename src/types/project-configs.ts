import type { COMMON_CSS_FRAMEWORKS_OPTIONS, COMMON_CSS_PREPROCESSORS_OPTIONS, COMMON_HTTP_OPTIONS, COMMON_PATH_ALIASING_OPTIONS } from '@/questions/options/common'
import type {
  NODE_BUNDLERS_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '@/questions/options/node'
import type {
  REACT_BUILD_TOOLS_OPTIONS,
  REACT_QUERY_OPTIONS,
  REACT_ROUTING_LIBRARIES_OPTIONS,
  REACT_STATE_MANAGEMENT_OPTIONS,
} from '@/questions/options/react'
import type { VUE_BUILD_TOOLS_OPTIONS } from '@/questions/options/vue'

export interface NodeProjectConfig {
  webserverPkgs?: typeof NODE_WEBSERVER_OPTIONS[number]['value']
  tsRuntimePkgs?: typeof NODE_TS_RUNTIME_OPTIONS[number]['value']
  preinstallPkgs?: string[]
  bundler?: typeof NODE_BUNDLERS_OPTIONS[number]['value']
}

export interface CommonProjectConfig {
  cssFramework?: typeof COMMON_CSS_FRAMEWORKS_OPTIONS[number]['value']
  cssPreprocessor?: typeof COMMON_CSS_PREPROCESSORS_OPTIONS[number]['value']
  httpLibrary?: typeof COMMON_HTTP_OPTIONS[number]['value']
  modulePathAliasing?: typeof COMMON_PATH_ALIASING_OPTIONS[number]['value']
}

export interface ReactProjectConfig extends CommonProjectConfig {
  buildTool?: typeof REACT_BUILD_TOOLS_OPTIONS[number]['value']
  routingLibrary?: typeof REACT_ROUTING_LIBRARIES_OPTIONS[number]['value']
  stateManagement?: typeof REACT_STATE_MANAGEMENT_OPTIONS[number]['value']
  queryLibrary?: typeof REACT_QUERY_OPTIONS[number]['value']
}

export interface VueProjectConfig extends CommonProjectConfig {
  buildTool?: typeof VUE_BUILD_TOOLS_OPTIONS[number]['value']
  useRouter?: boolean
  usePinia?: boolean
}
