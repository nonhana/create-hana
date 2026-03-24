import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  clean: true,
  minify: true,
  deps: {
    neverBundle: [/^node:/],
  },
  shims: true,
  hash: false,
})
