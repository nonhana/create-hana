import type {
  COMMON_CODE_QUALITY_TOOLS_OPTIONS,
  COMMON_LANGUAGE_OPTIONS,
  COMMON_MANAGER_OPTIONS,
} from '@/questions/options/common'
import type {
  NODE_BUNDLERS_OPTIONS,
  NODE_TS_RUNTIME_OPTIONS,
  NODE_WEBSERVER_OPTIONS,
} from '@/questions/options/node'
import type {
  REACT_BUILD_TOOLS_OPTIONS,
  REACT_CSS_FRAMEWORKS_OPTIONS,
  REACT_CSS_PREPROCESSORS_OPTIONS,
  REACT_HTTP_OPTIONS,
  REACT_PATH_ALIASING_OPTIONS,
  REACT_QUERY_OPTIONS,
  REACT_ROUTING_LIBRARIES_OPTIONS,
  REACT_STATE_MANAGEMENT_OPTIONS,
} from '@/questions/options/react'

export interface CommonProjectConfig {
  language?: typeof COMMON_LANGUAGE_OPTIONS[number]['value']
  pkgManager?: typeof COMMON_MANAGER_OPTIONS[number]['value']
  codeQualityTools?: typeof COMMON_CODE_QUALITY_TOOLS_OPTIONS[number]['value']
  codeQualityConfig?: boolean
}

export type NodeProjectConfig = {
  webserverPkgs?: typeof NODE_WEBSERVER_OPTIONS[number]['value']
  tsRuntimePkgs?: typeof NODE_TS_RUNTIME_OPTIONS[number]['value']
  preinstallPkgs?: string[]
  bundler?: typeof NODE_BUNDLERS_OPTIONS[number]['value']
} & CommonProjectConfig

export type ReactProjectConfig = {
  buildTool?: typeof REACT_BUILD_TOOLS_OPTIONS[number]['value']
  cssFramework?: typeof REACT_CSS_FRAMEWORKS_OPTIONS[number]['value']
  cssPreprocessor?: typeof REACT_CSS_PREPROCESSORS_OPTIONS[number]['value']
  routingLibrary?: typeof REACT_ROUTING_LIBRARIES_OPTIONS[number]['value']
  stateManagement?: typeof REACT_STATE_MANAGEMENT_OPTIONS[number]['value']
  httpLibrary?: typeof REACT_HTTP_OPTIONS[number]['value']
  queryLibrary?: typeof REACT_QUERY_OPTIONS[number]['value']
  modulePathAliasing?: typeof REACT_PATH_ALIASING_OPTIONS[number]['value']
} & CommonProjectConfig
