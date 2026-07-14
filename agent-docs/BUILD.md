# Build

## Install

`pnpm install`

The repository pins `pnpm@11.13.0` and keeps shared dependency versions in the root catalog.

## Develop

`pnpm dev`

This runs `src/index.ts` through `tsx` and starts the interactive CLI.

## Package

`pnpm build`

`tsdown` bundles `src/index.ts` as ESM into `dist/index.mjs`; `prepack` runs this build before publishing.

## Static validation

`pnpm typecheck`

The TypeScript configuration is strict and uses the `@/` alias for `src/`.
