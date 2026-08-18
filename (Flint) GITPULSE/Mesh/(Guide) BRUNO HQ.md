---
id: 5638ce21-0604-4c61-b1b0-cb0292967e92
title: "BRUNO HQ"
type: guide
project: "GitPulse"
tags:
  - "#note"
  - "#project"
  - "#ld/living"
  - "#cluster/personal"
status: active
source_path: "/Users/brunojaamaa/Desktop/Main Vault/Main/Mesh/(Map) BRUNO HQ.md"
created: "2026-08-17"
updated: "2026-08-17"
---

# BRUNO HQ — the hub above this vault

This Flint is a **child** of BRUNO HQ. The hub summarises; this vault and the repo beside it
are the truth.

**The hub's front door:**
`/Users/brunojaamaa/Desktop/Main Vault/Main/Mesh/(Map) BRUNO HQ.md`

⚠️ **The hub's note for this project is stale, and its largest error is an omission.**
`Main/Mesh/Notes/Projects/(Note) GitPulse.md` does not mention npm at all — but
**`@aethereumdev/gitpulse@1.0.0` is published and live**, which is the single biggest state
change in this project's history. It also records `path: none`, `status: dormant`, "33 tests"
against an actual **122**, and "Node 18+" against an actual **>= 20**.

Full list in [[(Report) Gaps & Questions]]. **Repo wins over note.**

## 🔴 One cross-project link the hub does **not** record

**`ctxbench` draws 7 of its 24 benchmark tasks from this repository** — hand-authored
defects injected at **pinned commits**, prefixed `gp-`, clustered on
`src/utils/formatting.ts` and `src/utils/scoring.ts`. That makes gitpulse load-bearing for a
**published experiment**, and the dependency is on its *commit history* rather than on
anything it outputs.

ctxbench's own gap register listed this repo as **G9** — *"7 of 24 tasks come from
`/Users/brunojaamaa/Desktop/gitpulse`, which has no Flint vault in the registry at the time
of writing"*. **This vault closes that gap.**

⚠️ **Never rewrite history on `master`.** Full detail in [[(Note) Downstream Consumers]].

## Two cross-project links the hub records, both real

- **`--export` produces a Three.js scene graph** consumed by the 3D GitHub Visualizer. ✅
  Confirmed on both sides: `src/ui/export.ts` here, `src/scene/sceneGraph.js` there, added in
  that project's Sprint 8 as gitpulse interchange.
- **GitPulse is the direct ancestor of `ccline`** — same instincts a year apart: a terminal
  tool, near-zero runtime dependencies, fast, opinionated about which number to show.

## One hub claim worth a footnote

The hub note contrasts "ccline's 1,035 tests to GitPulse's 33". The GitPulse half of that
comparison is now **122**, and two of the original 33 verified nothing at all —
`src/__tests__/cache.test.ts` was asserting an inline expression and importing no product
code. The contrast still holds in direction; the number does not.
