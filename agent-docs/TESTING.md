# Testing

## Commands

- All tests: `pnpm test`
- One file: `pnpm exec vitest run src/questions/__tests__/question-engine.test.ts`
- UI mode: `pnpm test:ui`
- Coverage: `pnpm test:coverage`
- Generated-project smoke matrix: `pnpm test:smoke`

## Conventions

Vitest runs in the Node environment with globals enabled. Tests are colocated in `src/**/__tests__/*.test.ts`; end-to-end generation assertions live in `src/__tests__/integration.test.ts`.

The smoke suite creates temporary projects, installs their dependencies with npm, then runs their generated lint, build, and test commands. Use it when changing generated dependency, script, or template combinations.
