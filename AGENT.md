# AGENT.md

## Scope

This document is for agents and LLMs working inside `packages/create-hana`.

`create-hana` is a pure ESM TypeScript CLI package for scaffolding JS/TS projects. The current supported project families are:

- `node`
- `react`
- `vue`
- `hono`

The package is configuration-driven. It asks interactive questions, builds a typed `Config`, mutates a shared `ProjectContext`, and finally writes generated files to disk.

## Quick Commands

- Install deps: `pnpm install`
- Dev entry: `pnpm dev`
- Build: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Coverage: `pnpm test:coverage`

## High-Level Architecture

End-to-end flow:

1. `src/index.ts`
   Bootstraps the CLI entry.
2. `src/cli/index.ts`
   Shows intro/outro, runs interactive questions, then calls `generateProject`.
3. `src/questions/**`
   Builds the final `Config` by executing a declarative question graph.
4. `src/core/generator.ts`
   Orchestrates project generation and owns the generation pipeline.
5. `src/generators/**`
   Mutate `ProjectContext` in layers: language, build tool, project type, optional features.
6. `src/editor/**`
   AST-backed editors used when a feature needs to modify generated source instead of replacing whole files.
7. `src/utils/file-system.ts`
   Materializes `packageJson` and `files` to disk.

The important design choice is that generators do not write files directly. They mutate `context.packageJson`, `context.files`, and sometimes editor instances stored on the context. File I/O happens once at the end.

## Core Data Model

### `Config`

Defined mainly in `src/types/core.ts` and `src/types/project-configs.ts`.

Key facts:

- `Config` is a discriminated union keyed by `projectType`.
- Project-specific fields live in separate interfaces and are merged into the union.
- Several answers use `'none'` as a real sentinel value. Treat it as part of the contract, not as absence.
- `oxlint-oxfmt` is modeled specially: when selected, `enableTypeAware` becomes valid; otherwise it must not exist.

When adding a new question or project feature, update the type layer first. The question engine is permissive at runtime; type safety comes from these unions.

### `ProjectContext`

`ProjectContext` is the shared mutable state during generation:

- `config`: resolved answers
- `projectDir` / `cwd`
- `packageJson`: future `package.json`
- `files`: string map of relative output path to file content
- `fileExtension`: `.ts` or `.js`
- optional editors such as `viteConfigEditor` and `mainEditor`

Generators are expected to mutate this object in place.

## Source Map

### CLI and orchestration

- `src/cli/index.ts`: interactive entry
- `src/core/generator.ts`: validates config, initializes context, runs generators, saves editor output, writes files, optionally initializes git and installs dependencies

### Question system

- `src/questions/configs/**`: declarative question definitions
- `src/questions/options/**`: readonly option lists used by question configs
- `src/questions/engine.ts`: sequential runner with conditional question support

Question execution order is fixed:

1. common questions
2. project-specific questions for the chosen `projectType`
3. final questions

Question visibility is controlled by `when`, which supports:

- `cascade`: declarative field comparisons
- `static`: custom function based on current config

### Generators

- `src/generators/language/**`: baseline TS/JS setup and TS config generation
- `src/generators/build-tools/**`: build tool setup such as Vite
- `src/generators/projects/**`: project-family templates
- `src/generators/features/**`: cross-cutting code-quality tooling

The runtime order in `src/core/generator.ts` is:

1. language generator
2. project/build-tool generators
3. code-quality generator
4. `sortPackageJson`

### Editors

- `src/editor/core-editor.ts`: base AST editor using `recast`
- `src/editor/features/common.ts`: `addImport`, `addCode`
- `src/editor/features/vite.ts`: mutate `defineConfig(...)`
- `src/editor/features/jsx-provider.ts`: wrap rendered React tree with providers
- `src/editor/vue-sfc-editor.ts`: block-level Vue SFC editor

Current runtime usage:

- React main file uses `ReactMainEditor`
- Vite config uses `ViteConfigEditor`
- Vue SFC editor infrastructure exists but is not a central part of the active generation path yet

## Architectural Conventions

### 1. Generation is layered, not monolithic

Each layer handles one responsibility:

- language decides TS/JS baseline
- build tool adds build scripts/deps
- project generator lays down the initial template
- feature generators enrich the template

Do not create one giant generator that does everything for a project.

### 2. Mutate shared context, do not write eagerly

Preferred patterns:

- add deps via `addDependencies(...)`
- add scripts via `addScripts(...)`
- write file content into `context.files[path]`
- update generated source through editors when modifying an existing code file

Avoid:

- writing files directly inside feature generators
- serializing `packageJson` manually before the final write phase

### 3. Use editors when changing structured code

For React and Vite mutations, prefer AST-backed editors under `src/editor/**`.

Examples:

- adding a Vite plugin: `context.viteConfigEditor!.addVitePlugin(...)`
- adding aliases: `context.viteConfigEditor!.addViteAlias(...)`
- wrapping React root providers: `context.mainEditor!.addImport(...)`, `addCode(...)`, `addJsxProvider(...)`

Do not introduce regex/string surgery for files already covered by editor abstractions.

Note: `src/utils/vite.ts` contains older string-based helpers and tests, but the main generation path uses the editor-based implementation. Prefer the editor path for new work.

### 4. Guard project-specific behavior explicitly

Most generator functions start with:

- validate `config.projectType` exists
- validate it matches the generator's domain

Keep doing this. It prevents wrong cross-project usage and documents intent in code.

### 5. Keep templates local and composable

The project uses inline template strings for small generated files. That is the current house style.

Preferred approach:

- small helper function per template
- feature-specific file generation near the feature
- root/shared templates in `src/utils/template.ts` only when reused broadly

## Extension Rules

### Add a new question

Usually touch all of the following:

- `src/questions/options/**` if the question needs shared option constants
- `src/types/project-configs.ts` or `src/types/core.ts`
- `src/questions/configs/<project>.ts`
- the relevant generator that consumes the answer
- tests for question visibility and generation behavior

If the question depends on prior answers, encode that in `when` instead of ad hoc logic in the CLI.

### Add a new feature to an existing project type

Preferred sequence:

1. add typed config field
2. add question
3. implement feature generator near the owning project or cross-cutting area
4. call it from the owning project generator
5. add focused tests plus integration coverage if it changes generated output materially

Rule of thumb:

- use `src/generators/projects/common/**` only for features shared by React and Vue
- use `src/generators/projects/<type>/features/**` for project-family-specific features
- use `src/generators/features/**` only for cross-project code-quality/tooling concerns

### Add a new project type

Minimum touch points:

- `src/constants/project-types.ts`
- `src/types/project-configs.ts`
- `src/types/core.ts`
- `src/questions/configs/<new-project>.ts`
- `src/questions/configs/index.ts`
- `src/generators/projects/<new-project>/index.ts`
- `src/generators/projects/index.ts`
- `src/core/generator.ts`
- language config if TS behavior differs
- tests

If the new project uses a structured editable entry file, also decide whether it needs a dedicated editor and ensure `saveEditors(...)` persists it.

### Add a new editor-backed mutation

Checklist:

- extend `CoreEditor` with a mixin under `src/editor/features/**`
- keep methods chainable by returning `this`
- throw `ErrorFactory.validation(ErrorMessages.validation.fieldNotFound(...))` when the target file is unavailable
- update the editor type exports in `src/editor/index.ts`
- add unit tests for the new editor feature

## Code Style and Local Conventions

### TypeScript style

Observed project conventions:

- ESM imports only
- `@/` path alias inside this package
- strict TypeScript
- single quotes
- no semicolons
- trailing commas where formatter allows
- short guard clauses over nested conditionals
- inline `if` without braces is common for single statements
- write simple and clear comments where appropriate.

### Package mutation style

Prefer helpers:

- `addDependencies`
- `addScripts`
- `sortPackageJson`

Do not hand-roll repetitive `packageJson.dependencies = ...` merges unless the code is already in a small local switch and the helper would not improve clarity.

### Error handling style

The project has a custom error stack:

- `HanaError`
- `ErrorFactory`
- `ErrorHandler`

Use it when introducing new validation or system errors. For project invariants, prefer `ErrorFactory.validation(...)`.

### Logging

Use `logger` from `src/utils/logger.ts` for generation-phase user output. Do not add scattered `console.log` calls in runtime code unless the generated template itself intentionally demonstrates logging.

## Testing Guidance

Existing test strategy:

- unit tests for utilities and editor mixins
- tests for question engine behavior
- integration tests for end-to-end project generation

When changing behavior:

- add a unit test if you modify a helper/editor
- add or update an integration test if generated files, package scripts, or dependency sets change

Useful test targets:

- `src/editor/__tests__/**`
- `src/questions/__tests__/**`
- `src/generators/__tests__/**`
- `src/__tests__/integration.test.ts`

## Non-Obvious Facts

- `saveEditors(...)` in `src/core/generator.ts` currently persists only Vite config and React main. If you add more editor-managed files, update this function.
- Vue generation currently writes `src/main.*` directly from string templates rather than through `VueMainEditor`.
- Hono support is more template-driven and less editor-driven than React/Vue.
- Not every project/tooling matrix is equally mature. Before extending a combination, trace whether the corresponding generator branch actually exists.
- `removeExistFolder` is enforced both by a conditional question and a special-case runtime check in `QuestionEngine`.

## Current Repo Status

As of 2026-03-25, the local baseline is:

- `pnpm test`: passing
- `pnpm typecheck`: failing

The current typecheck failures are existing code issues in the repository, mainly around:

- `src/core/generator.ts` narrowing into the `oxlint-oxfmt` generator
- `src/generators/projects/hono/index.ts` config typing and a missing `generateVercelJson`
- `src/error/hana-error.ts` needing an `override` modifier on `cause`

Do not assume a clean `tsc --noEmit` baseline before making changes. If your work touches those areas, account for pre-existing failures separately from your own diff.

## Recommended Change Workflow For Agents

1. Start from the execution path that consumes the behavior you want to change.
2. Confirm the typed config field exists or add it first.
3. Make the smallest generator/editor change in the owning module.
4. Verify whether `packageJson`, `files`, and editor output are still the only mutation points.
5. Update tests closest to the changed subsystem.
6. Run `pnpm test` and `pnpm typecheck` when the change is code-facing.

## If You Need To Reason About A Bug Quickly

Use this mental model:

- wrong prompt or missing answer: inspect `src/questions/**`
- answer exists but no output changes: inspect `src/core/generator.ts` branch ordering and owning generator
- dependency/script wrong: inspect `src/utils/package-json.ts` callers
- Vite/React source mutation wrong: inspect `src/editor/**`
- files missing on disk: inspect `saveEditors(...)` and `writeProjectFiles(...)`

## Safe Defaults For Future Work

- Prefer extending existing generators over creating parallel alternative flows.
- Prefer additive feature generators over editing large base templates.
- Prefer AST-backed mutation for structured code.
- Prefer updating type unions and tests together.
- Prefer documenting matrix limitations in code comments or tests when support is intentionally partial.
