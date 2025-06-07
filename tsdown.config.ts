import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  sourcemap: false,
  clean: true,
  target: 'node16',
  shims: true, // Add shims for __dirname, __filename
})
