---
title: "Effect vNext Domain Model"
tags: ["architecture", "effect", "vnext", "blueprint", "modules", "relations", "recipes", "templates"]
created: 2026-07-20T00:00:00.000Z
updated: 2026-07-20T00:00:00.000Z
sources: ["effect-vnext-refactor-design.md", "../ApiPlayer/monorepo"]
links: ["effect-vnext-refactor-design.md", "effect-vnext-delivery-plan.md", "generator-extension-rules.md"]
category: architecture
confidence: high
schemaVersion: 1
---

# Effect vNext Domain Model

## Scope

This page defines the composition vocabulary and extension contract selected by [[effect-vnext-refactor-design]]. It is the source of truth for what belongs in the pure planning layer; Effect runtime concerns and release sequencing remain in the linked architecture and delivery pages.

## Domain Model

### Blueprint

A Blueprint is the complete validated intent for one generated workspace. Its fixed shape is one Workspace, zero or more Units, and typed Relations between Units. It is deliberately narrower than a generic graph so constraints and errors remain understandable.

### Workspace

The Workspace owns root-level concerns: package manager, workspace manifest, shared TypeScript policy, root scripts, dependency catalogs, task orchestration, and repository-wide tooling.

### Unit

A Unit is an independently addressable generated package such as a frontend application, backend application, or shared library. Each Unit has an identity, location, kind, selected Modules, and package-level resources.

### Module

A Module contributes one composable capability to a Workspace or Unit. Examples include Vue, React, NestJS, Vite, Pinia, ESLint, and a TypeScript library. A Module declares compatibility constraints and produces sourced Plan Fragments; it does not write files or prompt users directly.

### Relation Module

A Relation Module owns cross-Unit integration that cannot correctly belong to either endpoint alone. Examples include workspace dependencies and HTTP integration. It may contribute coordinated resources to multiple Units, such as dependency edges, proxy settings, ports, CORS, environment keys, and shared scripts.

### Recipe

A Recipe is a named, recommended Blueprint composition with defaults. It contains no generation logic. A full-stack monorepo is therefore a Recipe, not a new `projectType` branch.

### Plan Fragment

A Plan Fragment is a Module's immutable contribution to the output plan. Every contribution carries its origin so conflicts and dry-run output can explain which Module or Relation requested it.

### GenerationPlan And VirtualTree

The GenerationPlan is the fully merged, validated, immutable output plan. The VirtualTree is its in-memory file representation. Filesystem execution begins only after the plan is complete and conflict-free.

## Composition And Ownership Rules

- Every raw file path has exactly one owner.
- Static templates use only simple, explicit variable substitution.
- Structured resources are merged through resource-specific mergers, not string concatenation.
- `package.json`, workspace YAML, TypeScript configuration, dependency catalogs, environment declarations, and task graphs have dedicated structured representations.
- Known code-generation hotspots, such as application entry files and Vite configuration, are modeled semantically and rendered once by their owner.
- AST editing is reserved for future workflows that modify arbitrary existing source code; it is not the default mechanism for greenfield generation.
- Last-write-wins behavior is forbidden.
- Conflicts in file paths, scripts, dependency scopes or versions, catalogs, environment keys, ports, TypeScript paths, and task ordering must fail planning with both origins reported.
- Ordering is explicit only where output semantics require it. Module registration order must not silently change output.

## Template Layout

Templates move from generator getter functions to package-owned directories on disk. A Module references template assets through TemplateStore and supplies only declared variables. Templates must be inspectable without executing generator code.

Packaging is part of correctness. Release validation must use `pnpm pack` and inspect/install the produced tarball to prove that templates, dotfiles, executable modes, and runtime lookup paths survive publication. Detailed gates are in [[effect-vnext-delivery-plan]].

## First Monorepo Vertical Slice

The first complete monorepo Recipe mirrors only the useful topology of the ApiPlayer reference repository:

- pnpm workspace root.
- Vue 3 + Vite frontend Unit.
- NestJS + Fastify backend Unit.
- TypeScript shared-library Unit.
- Workspace dependency Relations from frontend and backend to the shared library.
- An HTTP integration Relation owning frontend proxy and URL, backend port and CORS, and the corresponding environment declarations.

This slice deliberately excludes ApiPlayer's business models, Redis, object storage, email, and deployment choices. Its purpose is to prove that cross-Unit glue belongs in typed Relations rather than Recipe conditionals.

## Extension Contract

Adding an in-repository first-party framework or feature should require:

1. A Module implementation with metadata, constraints, and Plan Fragment production.
2. Owned template assets or semantic resource contributions.
3. Focused unit, conflict, and golden tests.
4. One registry entry.

It must not require changes to a central framework union, prompt switch, generator dispatcher, or filesystem writer. CLI questions are derived from registry metadata and Recipe requirements, then validated into a Blueprint.

These rules replace the legacy extension pattern in [[generator-extension-rules]] only after the vNext path becomes authoritative.

## Third-Party Plugin Boundary

Third-party runtime plugins are explicitly deferred until Effect 4 is stable and the first-party Module contract has survived real migrations. Designing a public plugin system now would prematurely lock discovery, version negotiation, trust, arbitrary-code execution, and ABI boundaries. Any future plugin protocol must be data-oriented at its public edge and must not expose Effect types.

