---
title: "Effect vNext Refactor Design"
tags: ["architecture", "effect", "vnext", "blueprint", "modules", "monorepo", "templates", "generation-plan"]
created: 2026-07-20T00:00:00.000Z
updated: 2026-07-20T00:00:00.000Z
sources: ["agent-docs/ARCHITECTURE.md", "agent-docs/BUILD.md", "agent-docs/TESTING.md", "agent-docs/CODE_STYLE.md", "../ApiPlayer/monorepo", "effect@4.0.0-beta.98"]
links: ["generation-architecture.md", "generator-extension-rules.md", "verification-baseline-2026-07-14.md", "effect-vnext-domain-model.md", "effect-vnext-delivery-plan.md"]
category: architecture
confidence: high
schemaVersion: 1
---

# Effect vNext Refactor Design

## Status

This page records the design baseline reached during the Effect vNext refactor discussion. It is an implementation-ready direction, not an implementation record. The current engine remains authoritative until a vNext phase passes its acceptance gates and is released.

## Decision

Rewrite create-hana's generation core around a new generation domain model and Effect 4 Beta. Do not translate the current branch-heavy architecture mechanically into `Effect.gen`. The rewrite must make project composition explicit, deterministic, inspectable, and independently testable before filesystem effects run.

The target pipeline is:

```text
CLI / Recipe / non-interactive config
                |
                v
        Schema validation
                |
                v
 Blueprint: Workspace + Units + typed Relations
                |
                v
       Module Registry + constraints
                |
                v
       sourced Plan Fragments
                |
                v
 structured merge + conflict detection
                |
                v
 GenerationPlan / VirtualTree
                |
                v
 Effect executor: staging -> verify -> commit
                            |
                            v
                 post-actions: install / Git
```

## Why The Current Model Is Being Replaced

The current `Config -> ProjectContext -> generators -> filesystem` model assumes one project root, one mutable root `package.json`, and centrally dispatched framework branches. That assumption does not represent a workspace containing multiple applications and libraries. Adding or removing a first-class framework also touches many registries, questions, type unions, dispatchers, generators, tests, and exports; current repository history shows that this is structural coupling rather than incidental boilerplate.

Templates are embedded as TypeScript template strings across generator getter functions. This makes generated output difficult to inspect, edit, diff, package, and test independently from generator logic. Mutable editors and explicit persistence steps also make ownership and final output dependent on execution order.

See [[generation-architecture]] for the legacy pipeline and [[generator-extension-rules]] for its current extension rules.

## Goals

- A new framework or feature is added through its module, templates, tests, and one registry entry, without modifying a central framework switch.
- Single-package projects and frontend/backend/shared monorepos use the same composition model.
- The same validated Blueprint always produces the same GenerationPlan.
- Planning is pure and supports dry-run, origin tracing, conflict reporting, and golden tests without touching disk.
- Filesystem, prompts, process execution, installation, Git, reporting, and cleanup have typed Effect service boundaries.
- Generated artifacts have explicit ownership and deterministic merge semantics.
- Each migration phase is independently releasable and leaves the CLI usable.

## Non-Goals

- A universal arbitrary graph language for every possible repository topology.
- A general SAT solver or automatic capability solver in the first version.
- Arbitrary AST mutation of user-owned existing repositories.
- A complex template DSL.
- Runtime loading of third-party npm plugins in the first vNext release.
- Exposing Effect types as a public plugin ABI.
- Reproducing ApiPlayer's business domain, infrastructure services, or deployment setup.
- Replacing Clack with `effect/unstable/cli` during the Beta migration.

## Domain And Composition Contract

The exact definitions of Blueprint, Workspace, Unit, Module, Relation Module, Recipe, Plan Fragment, and GenerationPlan are recorded in [[effect-vnext-domain-model]], together with file ownership, merge rules, template layout, the first monorepo Recipe, and the first-party extension contract.

## Effect Boundary

Effect is the runtime and failure-management substrate, not the framework-composition model.

Use Effect for:

- Typed operational errors and recovery policy.
- Service dependencies and Layer-based runtime wiring.
- Scoped temporary directories and cleanup.
- Filesystem reads and writes.
- Prompt interaction.
- Process execution, package installation, and Git initialization.
- Reporting, cancellation, retries, and post-action orchestration.

Keep as ordinary immutable TypeScript:

- Blueprint normalization.
- Module constraint checking.
- Plan Fragment production where no runtime service is required.
- Structured resource merging.
- Conflict detection.
- GenerationPlan validation.

Use Schema only at I/O boundaries: CLI input, Recipe/config files, persisted manifests, and data returned by external processes. Schema does not replace the composition algorithm.

Runtime services should be limited to stable ports such as Prompt, TemplateStore, FileSystem, ProcessRunner, PackageCatalog, and Reporter. Framework Modules must not become Layers.

## Effect 4 Beta Policy

- Pin exact, matching versions of `effect`, `@effect/platform-node`, and `@effect/vitest`; do not use caret ranges.
- Isolate Beta-sensitive Effect APIs behind a small runtime adapter layer.
- Keep Clack and expose it through the Prompt service for the first vNext release.
- Do not make `effect/unstable/cli` a foundational dependency while Effect 4 remains Beta.
- Raise the vNext Node.js baseline to `>=22`.
- Revalidate imports and APIs whenever the pinned Effect Beta version changes.

The design was checked against Effect `4.0.0-beta.98`; the stable Effect line at the time was `3.22.0`. These version facts must be rechecked before implementation or upgrade.

## Execution And Delivery

The staged execution model, independently releasable migration phases, verification matrix, and rollback gates are recorded in [[effect-vnext-delivery-plan]].

## Rejected Alternatives

### Translate The Existing Architecture Into Effect

Rejected because it preserves the single-root mutable context, central branches, implicit ordering, and inline templates while adding Effect syntax. It changes mechanics without repairing the domain model.

### Make Recipes Own Generation Logic

Rejected because full-stack Recipes would become a new location for framework conditionals. Recipes must remain declarative compositions of reusable Modules and Relations.

### Public Runtime Plugin System In vNext Initial Release

Rejected for the initial release because it forces a stable ABI and trust model before the first-party contract is proven, and it spreads Effect Beta churn across third-party code.

### Generic Constraint Solver

Rejected for the initial release because current requirements can be expressed through explicit constraints and typed Relations. Add a solver only if real compositions demonstrate that deterministic validation is insufficient.

## Load-Bearing Assumption

This design assumes that cross-framework and cross-Unit glue can be expressed as typed Relations plus structured resource merging. If that assumption fails, Recipes will accumulate conditional generation logic and the architecture will reproduce the current coupling at a higher level.

Validate the assumption before broad migration with three real vertical slices:

1. A Node single-package project.
2. A React or Vue project with a complex feature combination.
3. The complete Vue/Nest/shared monorepo Recipe.

If any slice requires Recipe-owned generation branches, stop expansion and revise the Relation or resource model before adding more frameworks.
