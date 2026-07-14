# Code Style

Use ESM imports and the `@/` alias for code under `src/`. Formatting and ordinary TypeScript style are enforced by the Antfu ESLint configuration.

## Project conventions

- Add configuration fields to the typed `Config` union before adding questions or generator branches; `'none'` is a valid configuration value, not an omitted field.
- Add generated dependencies through `addDependencyPreset`, `addManagedDependencies`, or `addDependencies`; managed package versions belong in `src/dependencies/registry.ts`.
- Use `HanaError`, `ErrorFactory`, and `ErrorHandler` for application validation and system failures; use `logger` for generation-phase output.
- Use the AST-backed editors for React entry files and Vite configuration instead of string or regex edits.
