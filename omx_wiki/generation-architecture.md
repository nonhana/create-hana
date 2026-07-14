---
title: "Generation Architecture"
tags: ["architecture", "generation", "project-context", "editors"]
created: 2026-07-14T08:47:24.188Z
updated: 2026-07-14T08:48:13.595Z
sources: []
links: ["generator-extension-rules.md", "verification-baseline-2026-07-14.md"]
category: architecture
confidence: medium
schemaVersion: 1
---

# Generation Architecture

create-hana is a pure ESM TypeScript CLI that scaffolds Node.js, React, and Vue projects. The execution flow is src/cli -> src/questions -> typed Config -> generateProject -> ProjectContext -> writeProjectFiles. Generators mutate ProjectContext.packageJson, ProjectContext.files, and editor instances; only src/utils/file-system.ts materializes output. runGenerators applies layers in this order: language, project or build tool, code-quality tooling, then package-json sorting. React entry files and Vite config use AST-backed editors. saveEditors currently persists Vite config and React entry content, so any new editor-managed artifact needs an explicit persistence step.

---

## Update (2026-07-14T08:47:54.237Z)

create-hana is a pure ESM TypeScript CLI that scaffolds Node.js, React, and Vue projects. The execution flow is src/cli -> src/questions -> typed Config -> generateProject -> ProjectContext -> writeProjectFiles. Generators mutate ProjectContext.packageJson, ProjectContext.files, and editor instances; only src/utils/file-system.ts materializes output. runGenerators applies layers in this order: language, project or build tool, code-quality tooling, then package-json sorting. React entry files and Vite config use AST-backed editors. saveEditors currently persists Vite config and React entry content, so any new editor-managed artifact needs an explicit persistence step. For change-placement and dependency rules, see [[generator-extension-rules]].

---

## Update (2026-07-14T08:48:13.595Z)

create-hana is a pure ESM TypeScript CLI that scaffolds Node.js, React, and Vue projects. The execution flow is src/cli -> src/questions -> typed Config -> generateProject -> ProjectContext -> writeProjectFiles. Generators mutate ProjectContext.packageJson, ProjectContext.files, and editor instances; only src/utils/file-system.ts materializes output. runGenerators applies layers in this order: language, project or build tool, code-quality tooling, then package-json sorting. React entry files and Vite config use AST-backed editors. saveEditors currently persists Vite config and React entry content, so any new editor-managed artifact needs an explicit persistence step. For change-placement and dependency rules, see [[generator-extension-rules]]. For the latest known validation risks, see [[verification-baseline-2026-07-14]].
