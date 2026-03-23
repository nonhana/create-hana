import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  clean: true,
  target: 'node16',
  minify: true,
  deps: {
    neverBundle: [/^node:/],
  },
  shims: true,
  hash: false,
})
