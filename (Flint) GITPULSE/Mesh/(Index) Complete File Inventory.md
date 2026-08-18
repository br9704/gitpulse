---
id: f33cba49-7787-41ef-b536-2e8c94771b21
title: "Complete File Inventory"
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

# Complete File Inventory

Every tracked and untracked file in the repo, excluding `node_modules/`, `.git/` internals,
`dist/` and `.DS_Store`. Walk performed **2026-08-17**. Sizes in bytes.

**0 dataless iCloud files.** Every body listed was safe to read.

| Path | Bytes | Modified |
|---|---|---|
| `.eslintrc.json` | 580 | 2026-08-14 |
| `.github/workflows/ci.yml` | 2168 | 2026-08-14 |
| `.github/workflows/release.yml` | 2022 | 2026-08-14 |
| `.gitignore` | 178 | 2026-08-15 |
| `CLAUDE.md` | 14199 | 2026-08-15 |
| `DOCS-ENGINEERPROMPT.md` | 9621 | 2026-08-15 |
| `LICENSE` | 1069 | 2026-08-14 |
| `MOTION.md` | 5114 | 2026-08-15 |
| `PROJECT.json` | 6658 | 2026-08-15 |
| `README.md` | 21939 | 2026-08-15 |
| `RESEARCH-CONTEXT.md` | 8565 | 2026-08-14 |
| `SCORING.md` | 7752 | 2026-08-14 |
| `assets/demo.svg` | 30560 | 2026-08-15 |
| `masterplan.md` | 61522 | 2026-08-15 |
| `package-lock.json` | 128008 | 2026-08-14 |
| `package.json` | 1437 | 2026-08-15 |
| `src/__fixtures__/demo-profile.ts` | 31538 | 2026-08-14 |
| `src/__tests__/__snapshots__/renderers.test.ts.snap` | 19131 | 2026-08-14 |
| `src/__tests__/anim.test.ts` | 4399 | 2026-08-14 |
| `src/__tests__/cache.test.ts` | 4405 | 2026-08-14 |
| `src/__tests__/fixtures.ts` | 3117 | 2026-08-14 |
| `src/__tests__/formatting.test.ts` | 3499 | 2026-08-14 |
| `src/__tests__/github.test.ts` | 8972 | 2026-08-14 |
| `src/__tests__/renderers.test.ts` | 9676 | 2026-08-14 |
| `src/__tests__/scoring.test.ts` | 9567 | 2026-08-14 |
| `src/__tests__/setup.ts` | 417 | 2026-08-14 |
| `src/api/cache.ts` | 3015 | 2026-08-14 |
| `src/api/github.ts` | 6977 | 2026-08-14 |
| `src/index.ts` | 11085 | 2026-08-15 |
| `src/types/index.ts` | 3926 | 2026-08-14 |
| `src/ui/compare.ts` | 3728 | 2026-08-14 |
| `src/ui/export.ts` | 4632 | 2026-08-14 |
| `src/ui/header.ts` | 2257 | 2026-08-14 |
| `src/ui/heatmap.ts` | 4437 | 2026-08-14 |
| `src/ui/languages.ts` | 3057 | 2026-08-14 |
| `src/ui/minimal.ts` | 1580 | 2026-08-14 |
| `src/ui/repos.ts` | 2060 | 2026-08-14 |
| `src/ui/score.ts` | 4032 | 2026-08-14 |
| `src/ui/stats.ts` | 3362 | 2026-08-14 |
| `src/ui/theme.ts` | 4725 | 2026-08-15 |
| `src/utils/anim.ts` | 4541 | 2026-08-14 |
| `src/utils/colors.ts` | 1459 | 2026-08-14 |
| `src/utils/formatting.ts` | 2941 | 2026-08-14 |
| `src/utils/scoring.ts` | 10978 | 2026-08-14 |
| `tools/record-demo.mjs` | 7770 | 2026-08-15 |
| `tsconfig.json` | 777 | 2026-08-14 |
| `tsconfig.test.json` | 406 | 2026-08-14 |
| `vitest.config.ts` | 186 | 2026-08-14 |

## Excluded, with reasons

| Path | Reason |
|---|---|
| `node_modules/` — **76 MB** | dependency install tree |
| `dist/` — **436 KB** | `tsc` output, regenerable by `npm run build`. ⚠️ CI asserts `dist/__tests__` is absent |
| `.git/` internals | git plumbing. Read-only `git log`/`branch`/`status` used instead |
| `.DS_Store` — 2 | Finder metadata |
| `.env*` | **none present.** This repo holds no secret file |

⚠️ Note what is **not** in this list: no `AGENTS.md`, no `.cursor/`, `.codex/`, `.claude/` or
`.vscode/`. This repo carries **no agent tooling config at all**, unlike the other two in
this cluster.

Up: [[(Map) Master Map]] · see also [[(Report) Folder Audit]]
