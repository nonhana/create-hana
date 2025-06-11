export interface NodeProjectConfig {
  language?: 'javascript' | 'typescript'
  pkgManager?: 'pnpm' | 'yarn' | 'npm' | 'bun'
  webserverPkgs?: 'express' | 'fastify' | 'none'
  tsRuntimePkgs?: 'tsx' | 'esno' | 'ts-node' | 'none'
  preinstallPkgs?: string[]
  codeQualityTools?: 'eslint' | 'eslint-prettier' | 'biome' | 'none'
  codeQualityConfig?: boolean
  bundler?: 'tsup' | 'tsdown' | 'none'
}

export interface VueProjectConfig {
  language?: 'javascript' | 'typescript'
  pkgManager?: 'pnpm' | 'yarn' | 'npm' | 'bun'
  codeQualityTools?: 'eslint' | 'eslint-prettier' | 'biome' | 'none'
  codeQualityConfig?: boolean
}
