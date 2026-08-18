---
id: 74f6ac3a-f3ff-4b2b-afd7-5547868186a0
title: "Folder Audit"
type: report
project: "GitPulse"
tags:
  - "#report"
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

# Folder Audit

**Read-only walk of `/Users/brunojaamaa/Desktop/gitpulse`, 2026-08-17.** **0 dataless iCloud
files**, so every file body listed was safe to read.

Repo total **80 MB**, of which **76 MB is `node_modules`** and **436 KB is `dist/`**. Tracked
content is roughly **1 MB**. ⚠️ **This is by far the smallest of the three portfolio repos**,
which is the point — three runtime dependencies.

## Root — `/`

**17 files · 7 markdown, config, licence, lockfile.**

| File | What it is |
|---|---|
| `masterplan.md` | **933 lines.** Every sprint's acceptance gate, as-shipped delta and deferral, plus the `@aethereumdev` scoping decision and a recorded workflow deviation. Highest authority |
| `README.md` | **392 lines.** Includes an *Alternatives* table where four competing tools were **installed and run** |
| `CLAUDE.md` | 190 lines |
| `SCORING.md` | **180 lines.** ⚠️ Ships **inside the npm package**. States what the score does not measure **before** any formula |
| `DOCS-ENGINEERPROMPT.md` | 145 lines |
| `RESEARCH-CONTEXT.md` | 104 lines. The audit |
| `MOTION.md` | 71 lines. Amended at `87b10f5` for the retired green |
| `PROJECT.json` | the structured portfolio record |
| `package.json` | ⚠️ `@aethereumdev/gitpulse@1.0.0`, Node >= 20, 3 runtime deps, `files` allowlist |
| `tsconfig.json` · `tsconfig.test.json` | ⚠️ **two configs.** The build excludes tests, so typecheck needs its own |
| `.eslintrc.json` · `vitest.config.ts` · `.gitignore` | |
| `LICENSE` | MIT |

⚠️ **There is no `AGENTS.md` here**, unlike the other two repos. No `.cursor/`, `.codex/`,
`.claude/` or `.vscode/` either — this repo carries **no agent tooling config at all**.

**Category:** coding. **Verdict:** clean.

## `src/` — 232 KB, 21 files

| Subfolder | Files | Holds |
|---|---|---|
| `ui/` | **10** | 9 renderers + `theme.ts`. Largest `export.ts` **143**, `heatmap.ts` **115** |
| `__tests__/` | 8 | 6 suites (**122 tests**) + `fixtures.ts` + `setup.ts` |
| `utils/` | 4 | `scoring.ts` **348** · `anim.ts` **138** · `formatting.ts` **99** · `colors.ts` **58** |
| `api/` | 2 | ⚠️ `github.ts` **204** — **the only network surface**. `cache.ts` **124** |
| `types/` | 1 | `index.ts` **168** |
| `__fixtures__/` | 1 | ⚠️ `demo-profile.ts` **1,512** — the captured `torvalds` snapshot. **Data, not logic** |
| root | 2 | `index.ts` **324** — commander entry |

`src/__tests__/__snapshots__/renderers.test.ts.snap` (20 KB) pins every renderer's output
byte for byte.

Full breakdown in [[(Note) Source Map]].

## `tools/` — 8 KB, 1 file

`record-demo.mjs`, **198** lines. Regenerates `assets/demo.svg` from a **real timed capture**
of `gitpulse --demo`. ⚠️ **Nothing enforces the committed SVG is current.**

## `assets/` — 32 KB, 1 file

`demo.svg` — the recorded terminal capture the README and case study display. Served to the
README from `raw.githubusercontent.com` on the **`master`** branch, so ⚠️ **renaming the
branch would break the README image on GitHub and npm**.

## `.github/workflows/` — 8 KB, 2 files

| File | Runs |
|---|---|
| `ci.yml` | **9 checks** on **Node 20, 22, 24**, every push, every branch. Five of the nine are publishing checks |
| `release.yml` | ⚠️ the **OIDC release workflow**. Exists, but trusted publishing is **not yet in effect** — owner-gated in Sprint 7 |

## `dist/` — 436 KB, excluded

`tsc` output. ⚠️ CI asserts `dist/__tests__` is **absent** — Sprint 4's test helpers once
compiled into it and would have shipped inside the packed tarball.

## Duplicate, dead and abandoned

**No dead code found.** Specifically checked:

- **0** `TODO`, `FIXME`, `HACK` or `XXX` markers in `src/` or `tools/`
- **0** unused runtime dependencies — `boxen` and `node-fetch` were declared and imported
  nowhere, worth **24 packages**, and were removed
- **0** wall-clock timestamps in renderers — three had them, making output non-deterministic
- **0** tests that verify nothing — `cache.test.ts` asserted an inline expression and
  imported no product code; rewritten, now 11 real tests

⚠️ **Six stale local branches**, all merged: `docs/post-publish`, `docs/publish-record`,
`docs/sprint-d`, `feat/publish-readiness`, `fix/scoped-package-name`, `style/monochrome`.
`origin/feat/publish-readiness` also survives on the remote. **This is the only real
untidiness in the repo.**

The stale artefact in this project's chain is **outside the repo** — the hub note, which does
not mention npm at all. See [[(Report) Gaps & Questions]].

## Excluded from this audit, with reasons

| Path | Reason |
|---|---|
| `node_modules/` — **76 MB** | dependency install tree |
| `dist/` — **436 KB** | `tsc` output, regenerable by `npm run build` |
| `.git/` internals | git plumbing. Read-only `log`/`branch`/`status` used instead |
| `.DS_Store` (2) | Finder metadata |
| `.env*` | none present. No secret file exists in this repo |

Every other file appears in [[(Index) Complete File Inventory]].
