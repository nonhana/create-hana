---
title: "Effect vNext Delivery Plan"
tags: ["architecture", "effect", "vnext", "delivery", "verification", "release", "rollback"]
created: 2026-07-20T00:00:00.000Z
updated: 2026-07-20T00:00:00.000Z
sources: ["agent-docs/BUILD.md", "agent-docs/TESTING.md", "effect-vnext-refactor-design.md"]
links: ["effect-vnext-refactor-design.md", "verification-baseline-2026-07-14.md"]
category: architecture
confidence: high
schemaVersion: 1
---

# Effect vNext Delivery Plan

## Scope

This page defines how the architecture in [[effect-vnext-refactor-design]] is executed, verified, released, and rolled back. Every phase is independently mergeable and leaves create-hana in a usable state even if later phases never ship.

## Failure Model And Execution

Planning failures and execution failures are distinct.

- Planning failures include invalid Blueprint data, incompatible Modules, missing Relations, duplicate ownership, and structured-resource conflicts. They produce no filesystem changes.
- Execution failures include template loading, staging writes, process exit failures, installation, Git, verification, and final commit failures.
- Generation writes to a staging directory first, verifies the staged result, then commits it to the destination.
- Installation and Git are explicit post-actions. Their failure policy and cleanup behavior must be visible in the final plan and report.
- Dry-run renders the GenerationPlan, ownership, origins, and conflicts without materializing a project.

## Delivery Plan

### Phase 1: Establish A Trustworthy vNext Spine

Repair or isolate the current verification baseline, lock representative legacy behavior with golden fixtures, introduce the vNext domain model and pure planner, move a Node project to disk templates, and deliver `--dry-run`. The legacy engine remains the default.

Acceptance requires targeted vNext unit and golden tests, typecheck, lint, package-tarball inspection, and generation of a buildable Node project from the packed CLI.

### Phase 2: Prove Feature Composition

Migrate React and Vue projects plus their existing feature combinations to first-party Modules and structured mergers. Continue to ship the legacy engine as the default fallback.

Acceptance requires no central framework switch in the vNext path, stable golden output, explicit negative conflict tests, and packed-CLI install/build smoke tests for representative React and Vue matrices.

### Phase 3: Prove Workspace Composition

Ship the Vue/Nest/shared monorepo Recipe and its workspace-dependency and HTTP Relations.

Acceptance requires successful workspace install, typecheck, build, frontend-to-backend development proxy behavior, shared-package imports from both applications, dry-run origin tracing, and deterministic regeneration from the same Blueprint.

### Phase 4: Release And Cut Over

Publish through a prerelease channel such as `0.3.0-beta` with exact Effect versions. Make vNext the default only after golden, tarball, install/build smoke, cold-start, bundle-size, and representative workflow gates pass.

Acceptance requires documented rollback to the legacy engine and one full release cycle in which users can select the fallback.

### Phase 5: Remove The Legacy Engine

Delete the old generator only after the fallback window closes and no release-blocking regressions remain. This phase is independently valuable because it removes duplicate maintenance; it is not required for vNext to function.

Acceptance requires all supported Recipes to use vNext, removal of legacy-only branches and tests, and the same release gates used for cutover.

## Verification Matrix

Every phase must cover:

- Happy paths: supported single-project and workspace Recipes produce expected files and build successfully.
- Input errors: malformed non-interactive config and invalid Recipe values fail at Schema boundaries.
- Compatibility errors: incompatible Modules and missing required Relations identify all relevant origins.
- Merge errors: duplicate file ownership and conflicts in scripts, dependencies, ports, environment keys, paths, catalogs, and task order fail deterministically.
- Execution errors: template lookup, permission, process, installation, verification, and Git failures clean up or retain staging according to documented policy.
- Edge cases: dotfiles, executable modes, paths containing spaces, existing destination directories, cancellation, repeated dry-runs, and packed installation.
- Determinism: identical Blueprint and package catalog inputs produce byte-identical GenerationPlans.

The repository-level commands remain `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:smoke`, `pnpm build`, and `pnpm pack`, but each phase must also run focused tests before the full suite. Current known baseline failures are recorded in [[verification-baseline-2026-07-14]] and must be revalidated rather than assumed.

## Release Gates

- Pin the same exact Effect 4 Beta version across Effect packages.
- Generate smoke-test fixtures from the packed CLI, not only from the source checkout.
- Inspect the package tarball for templates, dotfiles, executable modes, and runtime asset lookup paths.
- Measure cold-start time and bundle size before making vNext the default.
- Keep the legacy engine selectable for one full release cycle after cutover.
- Remove the legacy engine only when every supported Recipe is covered by vNext release gates.

## Rollback Strategy

The legacy engine remains available through the prerelease and cutover window. vNext writes through staging and does not mutate legacy configuration. A failed vNext release can switch the default back to legacy without migrating user data. Exact Effect version pins allow a known-good Beta set to be restored if an upstream release regresses behavior.

