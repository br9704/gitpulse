---
id: 9a0e1c0d-3833-4031-892e-b17d3ac04f0a
title: "Project Summary — GitPulse"
type: project-summary
project: "GitPulse"
kind: "cli"
stack: "TypeScript 5.3 strict ESM · Node 20+ · chalk · commander · ora · Vitest 1.2"
tags:
  - "#report"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
health: green
health_note: "Published on npm at 1.0.0, 122 tests green on Node 20/22/24, three runtime dependencies, zero install-time lifecycle scripts, and every published claim traceable. Six stale local branches are untidy but harmless. The branch is master, not main, which will break automation that assumes otherwise."
last_commit: "2026-08-15"
path: "/Users/brunojaamaa/Desktop/gitpulse"
live_url: "https://www.npmjs.com/package/@aethereumdev/gitpulse"
case_study_url: "https://brunojaamaa.dev/projects/gitpulse"
repo: "https://github.com/br9704/gitpulse"
npm_package: "@aethereumdev/gitpulse"
cluster: "personal"
source_path: "/Users/brunojaamaa/Desktop/gitpulse"
created: "2026-08-17"
updated: "2026-08-17"
---

# GitPulse — Project Summary

🚀 **Shipped and published.** A GitHub profile rendered as a report card in your terminal —
profile, statistics, language share, ranked repositories, a code-activity heatmap, commit
patterns, streaks, and a documented 0–100 score. **`@aethereumdev/gitpulse@1.0.0` is live on
npm.**

**Finished, not a scaffold.** **22** commits, **122** tests verified by running them, CI
green on Node 20/22/24, **0** `TODO` or `FIXME` markers, **0** unpushed commits.

## ⚠️ Two facts that will trip automation

1. **The branch is `master`, not `main`.** The only one of Bruno's three portfolio-linked
   repos that does this. `git log origin/main..HEAD` fails here.
2. **The npm package is scoped: `@aethereumdev/gitpulse`, not `gitpulse`.** The unscoped
   name is not claimable — npm's similarity filter reserves it against the existing
   `git-pulse`, which has not shipped since 2022. The **binary** is still plain `gitpulse`.

## Purpose

GitHub's own profile page is a scroll. GitPulse renders the same public data as one screen.

But the rendering is not what distinguishes it. **The labelling is.** GitHub's public Events
API returns at most **300** events and reaches back a limited and *variable* period — often
far less than 90 days for a busy account. Most tools built on it print a fixed "last 90
days" header over whatever they got. GitPulse derives the window from the oldest event the
feed actually returned and prints it beside the number:

```
last 30 days of public code events  2026-07-16 → 2026-08-14
```

> **When the label and the data would disagree, the label changes, not the data.**

## State

Sprints 0 through 6 closed, plus Sprint D (documentation) and Sprint E (monochrome). Sprint
7 is owner-gated and holds three items. Published to npm on 2026-08-15.

The work began from an audit whose verdict was that **the tool worked and looked finished
but its own documented first command did not run**. `gitpulse torvalds` with no token hit
GitHub's 60 req/hr unauthenticated cap, because only `--token` was honoured. A first-time
user ran the README's command, got an error, and concluded the tool was broken. The fix was
about twenty lines.

## Key numbers

| | |
|---|---|
| Commits | **22** on `master`, last **2026-08-15**, clean, 0 unpushed |
| Authorship | **22 of 22** by Bruno Jaamaa — no bot commits, no history rewrite needed |
| Tests | **122** passing across **6** suites, verified by running them 2026-08-17 |
| CI matrix | Node **20, 22, 24** — every push, every branch |
| Runtime dependencies | **3** — `chalk`, `commander`, `ora` |
| GitHub endpoints read | **3** — user, repos, public events |
| Install-time lifecycle scripts | **0** |
| Network calls on the `--demo` path | **0**, and CI fails the build if it ever reaches the wire |
| Renderers | **9**, each with at least one test |
| Score | **0–100**, five weighted components, every formula documented |
| Cache | **30 min** TTL, evicting at **50** profiles |
| Code | **28** TS/MJS files, ~**5,200** lines — of which `demo-profile.ts` is **1,512** |
| `TODO`/`FIXME` | **0** |
| ⚠️ Stale local branches | **6** |

## Top risks

1. 🔴 **This repo is load-bearing for a published experiment, and the dependency is on its
   *commits*.** `ctxbench` draws **7 of its 24 benchmark tasks** from here — hand-authored
   defects injected at **pinned commits**, prefixed `gp-`, clustered on
   `src/utils/formatting.ts` and `src/utils/scoring.ts`. **Never rewrite history on
   `master`**, and confirm reachability before deleting any stale branch. Detail in
   [[(Note) Downstream Consumers]].
2. ⚠️ **The `master` branch will break automation that assumes `main`.** Cheap to handle,
   expensive to discover.
3. ⚠️ **The hub note omits the single biggest fact about this project: it is published on
   npm.** It also says `path: none`, `status: dormant`, "33 tests" (actual: **122**) and
   "Node 18+" (actual: **>= 20**). Six corrections in [[(Report) Gaps & Questions]].
4. **Six stale local branches** — `docs/post-publish`, `docs/publish-record`,
   `docs/sprint-d`, `feat/publish-readiness`, `fix/scoped-package-name`, `style/monochrome`.
   All merged work. `origin/feat/publish-readiness` also survives on the remote.
5. **The bundled `--demo` fixture is `torvalds`** — public data, but another person's
   profile shipping inside a published package. An open owner decision.
6. **The activity window is narrow and variable by nature.** Everything derived from the
   Events API — heatmap, commit patterns, streaks, two of the five score components —
   describes at most 300 events over a variable span. The tool prints the true window rather
   than assuming one, but it cannot widen it without GraphQL.

## Next 5 actions

1. **Fix the hub note** — six corrections, chiefly that the project is **published on npm**.
2. Delete the six merged local branches, and `origin/feat/publish-readiness` — ⚠️ **but
   check ctxbench's pinned commits are reachable from `master` first.**
3. Close Sprint 7: move npm releases onto **trusted publishing (OIDC)** so every version
   after the first carries a provenance attestation and no long-lived token exists.
4. Confirm by eye that the heatmap's column paint does not flicker in Terminal.app at 52
   columns. ⚠️ **An agent cannot see flicker** — this needs a human.
5. Decide whether the bundled demo fixture stays `torvalds` or becomes Bruno's own profile.

## The ten links that matter

[[(Map) Master Map]] · [[(Note) What GitPulse Is]] · [[(Note) Honest State]] ·
[[(Note) The Pipeline]] · [[(Note) Windows and Labelling]] ·
[[(Note) Key Decisions]] · [[(Note) The Scoring Model]] ·
[[(Note) CLI Surface]] · [[(Note) Downstream Consumers]] ·
[[(Report) Gaps & Questions]] · [[(Report) Folder Audit]]
