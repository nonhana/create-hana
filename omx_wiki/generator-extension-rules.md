---
title: "Generator Extension Rules"
tags: ["convention", "generators", "dependencies", "errors"]
created: 2026-07-14T08:47:24.372Z
updated: 2026-07-14T08:47:54.434Z
sources: []
links: ["generation-architecture.md"]
category: convention
confidence: medium
schemaVersion: 1
---

# Generator Extension Rules

Configuration is a discriminated Config union keyed by projectType. Add typed configuration fields before questions and generator branches; the value none is part of the configuration contract. Keep shared React/Vue features in src/generators/projects/common, project-specific features under the owning project, and only cross-project code-quality tools in src/generators/features. Generated dependency versions and scope are managed by src/dependencies/registry.ts and presets; generators should use the package-json dependency helpers rather than literal version strings. Use HanaError, ErrorFactory, and ErrorHandler for application failures, and logger for generation-phase output.

---

## Update (2026-07-14T08:47:54.434Z)

Configuration is a discriminated Config union keyed by projectType. Add typed configuration fields before questions and generator branches; the value none is part of the configuration contract. Keep shared React/Vue features in src/generators/projects/common, project-specific features under the owning project, and only cross-project code-quality tools in src/generators/features. Generated dependency versions and scope are managed by src/dependencies/registry.ts and presets; generators should use the package-json dependency helpers rather than literal version strings. Use HanaError, ErrorFactory, and ErrorHandler for application failures, and logger for generation-phase output. See [[generation-architecture]] for the pipeline these rules extend.
