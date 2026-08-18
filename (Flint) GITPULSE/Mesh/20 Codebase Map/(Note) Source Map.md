---
id: 7dd58160-a7bc-44b5-b559-9e012f72200f
title: "Source Map"
type: note
project: "GitPulse"
tags:
  - "#note"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse/src"
created: "2026-08-17"
updated: "2026-08-17"
---

# Source Map

## The largest file is not code

| File | Lines | What |
|---|---|---|
| `src/__fixtures__/demo-profile.ts` | **1,512** | ⚠️ The captured `torvalds` snapshot that powers `--demo`. **Data, not logic.** It carries absolute timestamps, which is why the clock has to be injectable |
| `src/utils/scoring.ts` | **348** | languages, activity window, streak, patterns, and the 0–100 score |
| `src/index.ts` | **324** | commander entry and every flag |
| `src/api/github.ts` | **204** | ⚠️ **the only network surface in the codebase** |
| `src/types/index.ts` | **168** | `UserProfile`, `ContributionWindow` and the rest |

## `src/ui/` — 9 renderers plus a theme

| File | Lines | Renders |
|---|---|---|
| `export.ts` | **143** | ⚠️ the **Three.js scene graph** consumed by the 3D GitHub Visualizer |
| `heatmap.ts` | **115** | the code-activity grid, painted column by column |
| `theme.ts` | **110** | the SIGNAL palette. ⚠️ **greyscale on near-black** since Sprint E — amber and green are retired |
| `score.ts` | **103** | the 0–100 number and its letter grade |
| `stats.ts` | **92** | |
| `compare.ts` | **84** | `--compare` head-to-head |
| `languages.ts` | **83** | share bars, forks excluded |
| `repos.ts` | **56** | ranked repositories |
| `header.ts` | **42** | the wordmark and profile block |
| `minimal.ts` | **40** | `--minimal`, five compact lines |

**Every one of the nine has at least one test.** Coverage here is by surface, not by line.

⚠️ **Every animated renderer takes `progress: number = 1`, and `progress === 1` returns
exactly the static string.** Do not add a renderer that breaks that contract — it is what
makes `--no-anim` byte-identity a type-level guarantee rather than a promise.

## `src/utils/` — 4 files

| File | Lines | Does |
|---|---|---|
| `scoring.ts` | **348** | the five components. ⚠️ **Shannon entropy** for language balance at line 101, `log₂` caps on stars and forks |
| `anim.ts` | **138** | `paint`, `reveal`, `after` — the staging primitives |
| `formatting.ts` | **99** | number and date formatting, 20 tests |
| `colors.ts` | **58** | |

## `src/api/` — 2 files

`github.ts` (**204**) and `cache.ts` (**124**). The cache is a 30-minute TTL over
`~/.gitpulse/cache`, evicting at 50 profiles.

## `tools/record-demo.mjs` — 198 lines

Regenerates `assets/demo.svg` from a **real timed capture** of `gitpulse --demo`, not a
mock-up. ⚠️ **Nothing enforces that the committed SVG is current** — remembering to run it is
manual, and the README says so.

## What is deliberately absent

| Absent | Why |
|---|---|
| Any rendering library | ANSI escapes and Unicode box-drawing only. Nothing to render but text |
| GraphQL | Would widen the activity window, but staying on REST was a deliberate choice |
| `boxen`, `node-fetch` | ⚠️ Both were declared as runtime dependencies and **imported nowhere** — worth **24 packages** in the install tree. Removed |
| Install-time lifecycle scripts | **0**, so `npx` works under npm v12 defaults. `prepublishOnly` is the only one and it runs at publish time |

Three runtime dependencies total: `chalk`, `commander`, `ora`.

## Cross-project dependency

`src/ui/export.ts` produces the scene graph that the **3D GitHub Visualizer** reads in
`src/scene/sceneGraph.js`. ⚠️ Changing the export shape breaks that consumer, and it is the
reason every derived float is quantised to 6dp. See [[(Note) CLI Surface]].
