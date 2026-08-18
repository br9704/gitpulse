---
id: cf0eb353-26d9-4bee-be06-3ed231c5d6a7
title: "Flint Init — GitPulse"
type: system
project: "GitPulse"
tags:
  - "#note"
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

# Flint Init — GitPulse

**This vault documents one repository: a TypeScript CLI that renders any GitHub profile as a
report card in the terminal, where every number states the window it was measured over.**

**It is published.** `@aethereumdev/gitpulse@1.0.0` is live on npm.

## What this workspace is

| | |
|---|---|
| Codebase | `/Users/brunojaamaa/Desktop/gitpulse` |
| Vault | `/Users/brunojaamaa/Desktop/gitpulse/(Flint) GITPULSE` |
| Repo | `https://github.com/br9704/gitpulse` |
| npm | `https://www.npmjs.com/package/@aethereumdev/gitpulse` — **v1.0.0** |
| Case study | `https://brunojaamaa.dev/projects/gitpulse` |
| Branch | ⚠️ **`master`**, not `main` |
| Cluster | `personal` |

## ⚠️ Two things that trip automation

1. **The default branch is `master`.** `git log origin/main..HEAD` fails here. Every script
   in `Shards/` uses `master` explicitly. This is the only one of Bruno's three
   portfolio-linked repos that does not use `main`.
2. **The registered Flint name is `GITPULSE`**, because `flint init` rejects `GitPulse` as
   mixed case. Every note carries `project: "GitPulse"`, the real name.

## The stack

| | |
|---|---|
| Language | **TypeScript 5.3**, strict, **ESM** |
| Runtime | ⚠️ **Node >= 20** (`engines`), not 18 |
| Runtime deps | **3** — `chalk`, `commander`, `ora`. That is the whole install tree |
| Test | **Vitest 1.2** — **122 tests**, 6 suites, verified by running them 2026-08-17 |
| Lint | ESLint 8 + `@typescript-eslint` 6 |
| CI | Node **20, 22 and 24**, every push, every branch |
| Install-time lifecycle scripts | **0** — so `npx` works under npm v12 defaults |

Primary stack tag: `#stack/typescript`.

## Where a fact actually lives

1. **`masterplan.md`** — **933 lines**. Every sprint's acceptance gate, as-shipped delta and
   deferral with its reason, plus the `@aethereumdev` scoping decision. Highest authority.
2. **`SCORING.md`** — **180 lines**. Every input, every weight, and — before any formula —
   **what the score does not measure**.
3. **`README.md`** (**392**) and **`CLAUDE.md`** (**190**).
4. **This vault** — the distilled state. A map, not a substitute.

`masterplan > CLAUDE.md > memory`.

## The session-start path

[[(Map) Master Map]] → the section `(Index)` you need → the note.

One file only? [[(Report) Project Summary]].

## What lives where

| Folder | Holds |
|---|---|
| `Mesh/00 Overview` | what it is, and its honest state |
| `Mesh/10 Architecture` | the pipeline, the window labelling, the animation identity |
| `Mesh/20 Codebase Map` | `src/` and the test suite |
| `Mesh/30 Setup & Run` | install, flags, environment, CI |
| `Mesh/50 Decisions` | the scoping decision and the design calls |
| `Mesh/60 Roadmap, Tasks & Ideas` | the owner-gated block and six stale branches |
| `Mesh/90 Reference` | the scoring model, the CLI surface, git history |

## Which shards apply

[[codebase-map-refresh]] · [[changelog-from-git]] · [[onboarding-guide]] · [[vault-audit]]

## Reaching the codebase reference

```bash
flint reference list      # GITPULSE → ~/Desktop/gitpulse
```

`flint reference codebase <name> <path>` adds **and** fulfils in one call in 0.6.0-dev.21.

## The rules

1. **Read-only outside this vault.** No destructive git — `log`, `show`, `status`, `branch`,
   `diff` only.
2. ⚠️ **Never run `npm publish`.** This package is live on the public registry at 1.0.0.
   `prepublishOnly` is the only lifecycle script and it runs at publish time.
3. **Never invent facts.** Unknown goes in [[(Report) Gaps & Questions]].
4. **Never copy secrets.** Names only: `GITHUB_TOKEN`, `GH_TOKEN`, `GITPULSE_CACHE_DIR`.
5. **Repo wins over note**, including over the hub note, which is stale.
6. **Tag list items must be quoted** — `- "#note"`.

## The principle the whole tool is built on

> **When the label and the data would disagree, the label changes, not the data.**

Everything interesting here follows from that one line.
