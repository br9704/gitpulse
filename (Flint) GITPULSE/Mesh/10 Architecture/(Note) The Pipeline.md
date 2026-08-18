---
id: 1ed53afa-87eb-433d-b379-989c5d4aa063
title: "The Pipeline"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/src/index.ts"
created: "2026-08-17"
updated: "2026-08-17"
---

# The Pipeline

**One path: flags → cache or network → `buildProfile()` → scoring → nine renderers →
staged output.** Two structural decisions make it hold together.

## 1. `buildProfile()` is split out from `fetchUserProfile()`

So the bundled `--demo` fixture runs **the exact same derivation the network path runs**.

> The demo is therefore **incapable of drifting from the product**. It is not a mock-up of
> the output; it *is* the output, with the three fetches replaced by a captured snapshot.

The same split made the whole pipeline testable without a network — which is why CI can stub
`fetch` to throw and assert `--demo` still renders.

⚠️ **It also forced an injectable clock.** The fixture carries absolute timestamps, so
without pinning `now` the demo would have decayed into an empty heatmap within a few months.
That is a real trap: a demo that quietly rots is worse than no demo, because it fails on a
schedule nobody is watching.

## 2. Every animated renderer takes `progress: number = 1`

And **`progress === 1` returns exactly the string the static path returns.**

> The animation **cannot** diverge from the real output, because the last frame *is* the real
> output.

That turns `MOTION.md`'s requirement — *"`--no-anim` must be byte-identical"* — from
something you verify after the fact into something **the type signature enforces**. Four unit
tests assert the identity directly.

## The network surface

`src/api/github.ts` (**204** lines) is the **only** place in the codebase that fetches.
Three endpoints:

| Endpoint | Bound |
|---|---|
| `GET /users/:name` | — |
| `GET /users/:name/repos` | ≤ **200**, `type=owner` |
| `GET /users/:name/events/public` | ≤ **300**, ⚠️ **flaky-tolerant** — the Events API is unreliable and the code expects it |

Tested against a mocked fetch across **200, 404, 403 primary, 403 secondary, 401, 429, 500**,
the pagination boundary, the flaky-Events path, and auth-header presence and absence — 21
tests in `github.test.ts`.

⚠️ **The 403 branch is split three ways** — primary rate limit, secondary rate limit, bad
credentials — so the message names the real problem. That was the priority-one fix from the
audit: a first-time user who got a generic 403 concluded the tool was broken.

## The cache

`src/api/cache.ts` (**124** lines). **30-minute TTL**, evicting at **50 profiles**, under
`~/.gitpulse/cache` or `GITPULSE_CACHE_DIR`. Bypass with `--no-cache`, clear with
`--clear-cache`.

## The staging layer

`src/utils/anim.ts` (**138** lines) — `paint`, `reveal`, `after`. Sections arrive in reading
order over **≤2.5 s**, stat values count up **without shifting column widths**, the heatmap
paints column by column, and the grade letter lands last after a beat.

Staging turns itself **off automatically** whenever output is piped, redirected, or run under
`CI` or `NO_COLOR`. Scripts get clean, instant text without asking.

## Determinism, twice earned

**Wall-clock time was removed from three renderers.** They were stamping it into their
output, so the same profile produced different bytes on every run and snapshots were
impossible.

⚠️ **Every derived float in the Three.js export is quantised to 6dp.** `Math.sin`, `cos`,
`sqrt` and `log2` are **not required to be bit-identical across platforms and are not** —
the export produced `x = 4.044661788320042` on macOS and `…043` on Linux, and CI failed on
all three Node versions. A scene that differs between machines cannot be diffed or cached,
which defeats the point of a contract another tool consumes. There is a regression test.

That contract is consumed by the 3D GitHub Visualizer — see [[(Note) CLI Surface]].
