---
id: 437d6331-4b67-4b18-9b2a-78962a465b7d
title: "Downstream Consumers"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse"
created: "2026-08-17"
updated: "2026-08-17"
---

# Downstream Consumers

**Two other projects depend on this repository, and one of them depends on its
*commits* rather than its output.** That is unusual enough to be worth stating plainly:
changing history here would break a published experiment.

## 1. ctxbench — 7 of 24 benchmark tasks are drawn from this repo

⚠️ **This is the load-bearing one.**

`/Users/brunojaamaa/Desktop/ctxbench` is a published benchmark. Its task corpus is **24
tasks**, split **17 from `ccline`** (prefixed `cc-`) and **7 from gitpulse** (prefixed
`gp-`). Every task is `source: own-repo` — a **hand-authored defect injected at a pinned
commit**, not a mined pull request. Both repos have **zero merge commits**, which is why
PR-mining was ruled out and hand-authoring chosen instead.

The seven tasks:

`gp-format-and-truncate` · `gp-grade-boundary` · `gp-number-suffix-boundary` ·
`gp-pair-formatters-a` · `gp-pair-formatters-b` · `gp-percent-precision` ·
`gp-scoring-bands`

They cluster on **two files**: `src/utils/formatting.ts` (**99** lines) and
`src/utils/scoring.ts` (**348** lines) — the grade boundaries and the number formatters.
Small, pure, heavily tested functions are exactly what a benchmark task wants.

### What this means for anyone working here

1. ⚠️ **Never rewrite history on `master`.** ctxbench pins commits. A force-push
   invalidates the tasks, and the benchmark is published.
2. ⚠️ **`git gc` and branch deletion are not free either.** If a pinned commit is only
   reachable from one of the six stale branches, deleting that branch could make it
   unreachable. **Check before deleting** — the housekeeping item in
   [[(Note) Roadmap and Open Work]] says "all merged", which is true of *content*, but
   reachability should be confirmed against ctxbench's pin list first.
3. **Refactoring `formatting.ts` or `scoring.ts` is fine** — the tasks run against pinned
   commits, not against `HEAD`. But it does mean a future ctxbench refresh drawing from
   `HEAD` would need re-authoring.
4. ⚠️ ctxbench excludes **one gitpulse test file** via `KNOWN_FLAKY`, because it snapshots
   a **relative timestamp**. In a paired benchmark design a flaky guard manufactures a
   difference out of wall-clock drift alone.

ctxbench's own [[(Report) Gaps & Questions]] recorded this repo as gap **G9** — *"7 of
24 tasks come from `/Users/brunojaamaa/Desktop/gitpulse`, which has no Flint vault in the
registry at the time of writing"*. **That gap is now closed by this vault.**

## 2. The 3D GitHub Visualizer — the `--export` scene graph

`gitpulse --export` emits a Three.js-compatible scene graph as JSON. The **3D GitHub
Visualizer** consumes it: `src/ui/export.ts` here, `src/scene/sceneGraph.js` there, added
in that project's Sprint 8 as gitpulse interchange.

⚠️ **The interchange format is platform-sensitive.** Matrix CI on Node 20/22/24 caught
`Math.sin`/`cos`/`sqrt`/`log2` differing in the **last digit** between macOS and Linux, so
the export now **quantises every derived float to 6 decimal places**. Without that, the
same profile produced different bytes on different machines and no snapshot could hold.

Both sides of this link are confirmed, and the hub note records it correctly.

## 3. ccline — the descendant, not a consumer

Worth naming so it is not mistaken for a dependency. **`ccline` is the direct descendant of
GitPulse**, not a consumer of it: the same instincts a year apart — a terminal tool,
near-zero runtime dependencies, fast, opinionated about which number to show. No code flows
between them. They meet only inside ctxbench, as the two source repos of one benchmark.

## Related

[[(Note) CLI Surface]] · [[(Note) The Scoring Model]] · [[(Note) Git History]] ·
[[(Guide) BRUNO HQ]] · [[(Index) 90 Reference]]
