# Architecture

## Generation flow

`src/cli/` collects answers, `src/questions/` resolves a typed `Config`, and `src/core/generator.ts` creates the shared `ProjectContext`. Generators then add package metadata and generated file content before `src/utils/file-system.ts` writes everything to disk once.

## Directory roles

- `src/generators/language/` — TypeScript or JavaScript baseline
- `src/generators/build-tools/` — build-tool setup
- `src/generators/projects/` — Node, React, and Vue templates plus their features
- `src/generators/features/` — cross-project code-quality tooling
- `src/dependencies/` — managed dependency registry, presets, resolution, and validation
- `src/editor/` — AST-backed React and Vite source mutations

## Boundaries

- Generators mutate `ProjectContext`; they do not write files directly. `writeProjectFiles` is the sole materialization step.
- Keep the generation order in `runGenerators`: language, project/build-tool, code-quality, then package-json sorting.
- Put React/Vue-shared features in `src/generators/projects/common/`; put project-specific features under the owning project; reserve `src/generators/features/` for cross-project tooling.
- `saveEditors` currently persists only Vite configuration and React entry output. Add persistence there before introducing another editor-managed generated file.
