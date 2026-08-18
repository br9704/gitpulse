---
id: 4a6b0089-cc12-4ecb-9738-49733d2d5bba
title: "Honest State"
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
source_path: "/Users/brunojaamaa/Desktop/gitpulse/masterplan.md"
created: "2026-08-17"
updated: "2026-08-17"
---

# Honest State

🚀 **Working, tested and published.** `@aethereumdev/gitpulse@1.0.0` is live on npm. **22**
commits on `master`, clean, **0** unpushed, last **2026-08-15**. **122** tests passing —
verified by running them on 2026-08-17, not taken from a document. **0** `TODO` or `FIXME`
markers.

⚠️ **All 22 commits are authored by Bruno Jaamaa.** No bot authorship, no history rewrite
needed. That distinguishes it from the 3D GitHub Visualizer, where 48 of 72 commits are bot
commits and the rewrite is still owner-gated.

## What the audit found

The verdict was unusual: **the tool worked and looked finished, but its own documented first
command did not run.**

`gitpulse torvalds` with no token hit GitHub's **60 req/hr** unauthenticated cap, because
only the `--token` flag was honoured and most people's per-IP budget is already spent by
something else. A first-time user ran the README's command, got an error, and concluded the
tool was broken.

That was priority one and it was about **twenty lines**: read `GITHUB_TOKEN`/`GH_TOKEN` from
the environment, split the 403 branch into primary rate limit, secondary rate limit and bad
credentials so the message names the real problem, and ship `--demo` so the output is
reachable with no setup at all.

## Then the numbers

`generateContributions` had been counting **every** public event type as a "contribution"
under a hardcoded `Last 90 days:` header, while reporting an active-day count derived from a
**third** window. Three windows, one label, on a screen about a real person.

⚠️ **The rewrite's own first implementation was also wrong**, and the sprint's acceptance
gate caught it: it widened the window to GitHub's nominal 90-day retention whenever the
300-event cap was not hit, which rendered `torvalds` as a 90-day grid containing **60 days of
fabricated inactivity** for a feed that only reaches back 30.

Four more defects surfaced the same way, by rendering real profiles and reading the result:

| Defect | Consequence |
|---|---|
| `src/__tests__/cache.test.ts` asserted an inline expression and imported **no product code** | **two of the then-33 "passing tests" verified nothing** |
| Sprint 4's test helpers compiled into `dist/` | they would have shipped inside the packed tarball. CI now asserts `dist/__tests__` is absent |
| `boxen` and `node-fetch` declared as runtime dependencies, imported nowhere | **24 packages** in the install tree of a project whose first rule is zero runtime bloat |
| Three renderers stamped wall-clock time into their output | the same profile produced **different bytes on every run**, so snapshots were impossible |

## Measurement changed the design twice

**Floating point is not portable.** The first CI run failed on all three Node versions, and
the failure was real: `Math.sin`/`cos`/`sqrt`/`log2` are **not required to be bit-identical
across platforms and are not**, so the Three.js scene export produced
`x = 4.044661788320042` on macOS and `…043` on Linux. A scene that differs between machines
cannot be diffed or cached, which defeats the point of a contract another tool consumes.
Every derived float is now **quantised to 6dp** with a regression test.

**Writing the docs corrected the product.** Writing `SCORING.md` meant checking the weights
instead of describing them, which produced the sharpest correction in the project: ⚠️ **the
star sub-item caps at 40 stars, not the ~215 the first draft claimed.** Above 40 stars that
input stops discriminating entirely, so a **250,000-star repository scores identically to a
40-star one**. The document now says so, because it materially changes how the number should
be read.

## Verification

There are no benchmarks here. There is a CI job that **refuses to let the output regress**,
running on **Node 20, 22 and 24**, on every push to every branch.

| Check | Proves |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run typecheck` | `src/` **and** the tests type-check — the build config excludes tests, so `tsc` alone would not see them |
| `npm run build` | `tsc` exit 0 |
| `npm test` | every renderer and the network layer, pinned by committed snapshots |
| `dist/__tests__` absent | test helpers cannot leak into the published tarball again |
| `node dist/index.js --demo` | the product actually renders |
| demo with `fetch` stubbed to throw | `--demo` makes **zero** network calls |
| piped output scanned | no character with the Unicode `Emoji_Presentation` property, no ANSI escape |
| `npm pack --dry-run` | package contents are what they should be |

**Coverage is by surface, not by line.** Every one of the nine renderers in `src/ui/` and
`src/api/github.ts` has at least one test. The network layer is tested against a mocked fetch
across 200, 404, 403 primary, 403 secondary, 401, 429, 500, the pagination boundary, the
flaky-Events-API path, and auth-header presence and absence.

Colour is pinned off globally in `src/__tests__/setup.ts`, so snapshots are readable plain
text and **cannot pass locally while failing in CI**.

## Limitations, and most of them are printed on screen

| Limit | Detail |
|---|---|
| ⚠️ **The activity window is narrow and variable** | At most **300** events over a limited, variable span. Everything derived from it — heatmap, commit patterns, streaks, **two of the five score components** — describes that window and no more. Older activity is invisible to the tool, **not absent from your life**. Widening it needs GraphQL, and staying on REST was deliberate |
| **"Languages" counts repositories, not lines** | Each non-fork repo contributes 1 to its GitHub-assigned primary language, so a 300,000-line C project and a one-file C script count the same. The section says so on screen |
| **The score reads no code and cannot see private work** | A staff engineer whose entire output is private will score badly. That is a limit of the data, not a finding about them. It also stops discriminating above **40 stars** on one sub-item |
| **The bundled `--demo` fixture is `torvalds`** | Entirely public data, and the profile the docs already use — but it is **another person's profile shipping inside a published package** |
| **The `> repos 34/61` fetch counter is not implemented** | `MOTION.md` asks for it. The honest position is that the counter would be **fiction**: the repo total is not known until the first page returns, and the endpoint paginates at most twice |
| **No end-to-end test drives the CLI as a subprocess** | The `--no-anim` byte-identity check does exactly that, but it needs a forced TTY and lives outside the suite |
| **Nothing enforces that `assets/demo.svg` is current** | `npm run demo:record` regenerates it from a real run; remembering to is manual |

## Housekeeping debt

⚠️ **Six stale local branches**, all merged: `docs/post-publish`, `docs/publish-record`,
`docs/sprint-d`, `feat/publish-readiness`, `fix/scoped-package-name`, `style/monochrome`.
`origin/feat/publish-readiness` also survives on the remote. Harmless, untidy, and the only
real housekeeping in the repo.

## The alternatives were run, not repeated

Four competing tools were **installed and run** in August 2026 before being described. ⚠️
**Two of the four no longer do what they say** — `github-readme-stats` was deprecated
2026-06-30, and `ghcal` renders an empty calendar for every user because it scrapes
`data-count` attributes GitHub's markup no longer emits.

The README also names the one tool GitPulse does **not** replace: `git-stats` against a local
clone beats anything built on the public Events API, including this.
