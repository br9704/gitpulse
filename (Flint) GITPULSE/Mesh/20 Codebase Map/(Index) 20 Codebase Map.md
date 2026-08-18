---
id: edc61575-a778-4964-b0a3-a4b53b57469c
title: "20 Codebase Map"
type: index
project: "GitPulse"
tags:
  - "#index"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse"
created: "2026-08-17"
updated: "2026-08-17"
---

# 20 Codebase Map

**28 TypeScript/MJS files, ~5,200 lines** — of which **1,512 are a single captured fixture**.
The product itself is small.

| Note | Covers |
|---|---|
| [[(Note) Source Map]] | `src/` — entry, api, ui, utils, types, fixtures |
| [[(Note) Tests and CI]] | the 122 tests, the snapshots, and the nine CI checks |

## The shape

```
src/index.ts          commander entry, flags — 324 lines
src/api/              github.ts (the only network surface) · cache.ts
src/ui/               9 renderers + theme
src/utils/            scoring · anim · formatting · colors
src/types/            168 lines of shared types
src/__fixtures__/     demo-profile.ts — 1,512 lines, the offline snapshot
src/__tests__/        6 suites, 122 tests, + committed snapshots
tools/record-demo.mjs regenerates assets/demo.svg from a real run
```

Every file in the repo is listed in [[(Index) Complete File Inventory]].

Up: [[(Map) Master Map]]
