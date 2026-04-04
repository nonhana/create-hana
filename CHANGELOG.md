# create-hana

## 0.2.1

### Patch Changes

- 38e225f: Adjust the way Recast outputs the code; the default is to output single quotes.
- 38e225f: Fixed the undefined issue caused by the main editor not being created when creating a Vue project.

## 0.2.0

### Minor Changes

- 346abe8: Introduce a managed template dependency registry with preset-based resolution, migrate generators away from hard-coded package versions, remove invalid `hono/*` pseudo dependencies from generated `package.json`, and add template smoke-test CI plus Renovate support for registry-managed updates.

## 0.1.0

### Minor Changes

- 8a2dfee: Integrate Oxlint and Oxfmt.
  Refactor question options type, support function and array types, making it more flexible to define options.
